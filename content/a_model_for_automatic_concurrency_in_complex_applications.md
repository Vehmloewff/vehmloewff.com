---
date: 6/14/24
title: A Model for Automatic Concurrency in Complex Applications
description: >-
  We can construct a graph, noting which tasks depend on which, where the
  sequential execution can split into concurrent execution, and where the
  concurrent execution must be joined back into sequential execution.
searchable: true
topics: coding
---

Safe concurrency could one of the hardest problems that most programmers will encounter. In this arena, if you're not willing to expense safety for the sake of performance, or performance for the sake of safety, you'll likely find that implementation of application concurrency is complex, brittle, and time consuming.

In some cases, the application simple enough (or is very well designed) that concurrency can be easily achieved. An example of this would be a text editor that performs some sort of analysis on the text. Because it is necessary that the main thread remain unblocked so that it can provide feedback for keystrokes with little delay, it is a relatively simple matter to start another thread that listens for a message indicating that the editor state changed and respond with a message containing the analysis result.

In other cases, the nuances associated with a usable concurrency model are complex. These nuances can be the result of a large number of tasks to which concurrency should be applied, a heavy I/O load on each of those tasks, or some sort of state that the potentially concurrent tasks need to reference or mutate. Although other applications can be very complex in their own right, it is these applications are referred to in this article as "complex applications", the complexity being defined as such in regards to the implementation of a usable concurrency model, not necessarily complexity in general.

Also, it is worth noting that, in this article, safety is defined in that it undefined behavior and race conditions are prevented.

# Safety at the expense of performance

As a result of the decision to keep things safe, the common concurrency models in use today rely heavily on copying data or atomic operations. While the result of this is often faster than implementing no concurrency, models that rely heavily on these methods are innately inefficient. As a whole, most (JIT) interpreted languages fall into this category.

# Performance at the expense of safety

Another approach is to lean heavily into concurrency, even when it could result in race conditions or undefined behavior, then write logic around such vulnerabilities in an effort to prevent them. As a whole, most languages that are compiled for CPU execution fall into this category, with Go and Rust being two noteworthy exceptions.

# Expensive Concurrency

As both of the above approaches are less than ideal in multiple scenarios, sometimes it is necessary to eek performance out of safe code. This is a model that (safe) Rust promotes.

Rust does this by putting all the concurrency-related decision making into the hands of the developer, allowing it to tweaked to perfection. When a simple transfer of ownership is all that is needed, that can be done. When an atomic is necessary, you have high-level abstractions such as `Arc`, `Mutex`, and `RwLock` at your disposal. When copying is best, that can be done too.

This is quite powerful because, as it turns out, not a single type of operation is always best. Coping, ownership transfer, and atomics each have their benefits and trade offs. (safe) Rust is great, because it allows you to choose, while providing framework of safety that you can lean on. However, abstractions that are beneficial for concurrency are not always ergonomic. Consider the following example:

```rust
fn some_expensive_operation(cache: &mut Cache, input: Input) -> ValuableResult {
    if let Some(value) = cache.get(input.id()) {
        return value;
    }

    // ...

    cache.set(input.id(), newly_computed_result.clone());

    newly_computed_result
}

fn fetch_inputs() -> Vec<Input> {
  // ...
}

fn resolve_inputs(cache: &mut Cache) -> Vec<ValuableResult> {
    fetch_inputs()
        .drain(..)
        .map(|input| some_expensive_operation(cache, input))
        .collect()
}
```

While this code is perfectly valid as is, note that, if `fetch_inputs` returns a vector with a length that is greater than 1, the multiple calls to `some_expensive_operation` will be run sequentially, and cannot be made to run concurrently without some decent refactoring. This is because the concurrent part accepts a mutable reference to `Cache`, which could technically lead to undefined behavior.

Supposing that concurrency really was needed here, the developer would be forced to rewrite the code like this:

```rust
fn some_expensive_operation(cache: &mut Cache, input: Input) -> ValuableResult {
    if let Some(value) = cache.get(input.id()) {
        return input;
    }

    let newly_computed_result = compute_some_expensive_operation(input);

    cache.set(input.id(), newly_computed_result.clone());

    newly_computed_result
}

fn compute_some_expensive_operation(input: Input) -> ValuableResult {
    // ...
}

fn resolve_inputs(cache: &mut Cache) -> Vec<ValuableResult> {
    let expensive_operations_to_compute = Vec::new();
    let results = Vec::new();

    for input in fetch_inputs() {
        if let Some(value) = cache.get(input.id()) {
            results.push(value);
        } else {
            expensive_operations_to_compute.push(input);
        }
    }

    let mut computed_results = expensive_operations_to_compute
        .par_iter()
        .map(|input| (compute_some_expensive_operation(&input), input))
        .collect::<Vec<_>>();

    for (input, result) in computed_results {
        results.push(result.clone());
        cache.set(input.id(), result);
    }

    results
}
```

Additionally, consider the level of increased complexity that a few very reasonable constraints could induce.

- The response from `resolve_inputs` be in same order as the response from `fetch_inputs`. In the sequential example, this is a behavior that comes for "free", but with the concurrent example, an index would have to be tracked.
- `some_expensive_operation` being in another crate, making the refactoring of that function far more complicated.
- The cache key logic being complex or expensive, requiring more duplicated code or helper functions and the tracking of the initially computed cache key in `expensive_operations_to_compute` and `compted_results`.

Although this is a simple example, it can be seen that ergonomic abstractions, such as rust's `Iterator` and `some_expensive_operation` are inherently hard for a concurrency model to work with. This reality causes performant concurrency to be "expensive" because abstractions become more complicated, brittle, and less natural.

# Noteworthy mention: Go

Go's message-passing model is sound, often not requiring excessive copies or atomics, and isn't as expensive or brittle as the equally concurrent code would be in Rust. In some ways this is due to it being a garbage collected language, which minimizes the number of constraints that it's language authors have to engineer around. Go's model, however, is not suitable for all applications. The approach that will be proposed in the following paragraphs of this article could be a viable alternative to Go with it's own benefits and trade-offs, not a sure replacement.

# Strict programs

To start, this approach isn't likely to work well unless the program is written in a strict form. Specifically, the program shouldn't have many references that the compiler can't follow with static analysis. Consider the following JS code:

```rust
let doesKillMap = { vipers: true, spiders: false }

let doesKill = obj[prompt("Choose your venom: (vipers or spiders)")]
console.log("You could be ", doesKill ? "alive" : "dead")
```

During static analysis, the compiler cannot infer which value is being referenced. Is it `doesKillMap.vipers` or `doesKillMap.spiders`? Additionally, constructs such as `goto` cannot be permitted, as they make control flow too dynamic.

The outlined approach to concurrency should be successful to the extent that potential references, mutations, and control flow can be predicted during static analysis.

# De-abstraction

As we've seen in the Rust examples, it was our very own abstractions that made concurrency expensive. Unfortunately we can't code without abstractions because that would make everything else more expensive. This is why de-abstraction is necessary. Consider again the sequential rust example referenced earlier, specifically the implementation of the iterator in `resolve_inputs`. Where it to be inlined, it would look something like this:

```rust
let mut inputs = resolve_inputs();
let mut drain_iter = Drain { vec: &mut inputs };
let mut map_iter = Map { iter: &mut drain_iter };
let mut collected = Vec::new();

// The looping part of .collect()
loop {
    // Drain.next()
    // a simplification, irl, Drain does not give the vec in reverse
    let drained_input = drain_iter.vec.pop();

    // Map.next(), calling the our closure with the result of Drain.next():
    //   |input| some_expensive_operation(cache, input)
    let mapped = match drained_input {
        Some(input) => Some(if let Some(value) = cache.get(input.id()) {
            value
        } else {
            // ... expensive stuff

            cache.set(input.id(), newly_computed_result.clone());
            newly_computed_result
        })
        None => None
    }

    // The collection part of .collect
    collected.push(match mapped { Some(value) => value, None => break })
}
```

It is worth noting, however, that de-abstraction is somewhat complicated due to common methods of recursion found in code. However, the author is of the opinion that any sort of recursive control flow can be converted to a loop, although it would result in a needlessly bloated result. In most cases, however, the bloat will be reduced during the "compression" step.

# Logic flattening

Because of the safe nature of rust, it can be hard to completely simplify the above example. But, because we've assumedly already made the checks to insure that the initial code is safe, we can reduce the above code to an IR that is easier to analyze. For the sake of simplicity, we'll leave `resolve_inputs`, `Cache`, `Input`, and `Vec` untouched.

```rust
// Note: the code can be flattened into this simplification by walking the
// AST and tracking which conditions are met for each statement.

inputs = resolve_inputs()
collected = Vec::new()

loop:
    %1 = input.pop()
    %2 = null

    // match drained_input { Some(value) => ... }
    if(%1 is Option::Some):
        %2 = drained_input.0

    // if let Some(value) = cache.get(input.id()) { value }
    %3 = null
    if(%2 is not null):
        %3 = cache.get(%2.id())

    // if let Some(..) = cach... ...else {
    %4 = null
    if(%3 is Option::None):
        %4 = %2.expensive() // ... expensive stuff

    if(%3 is Option::None):
            cache.set(input.id(), %4.clone())

    // let mapped = match drained_input { ... }
    %5 = %3
    if(%3 is null):
        %5 = %4

    // match mapped { ... None => break }
    if(%5 is null)
        break

    // collected.push(...)
    collected.push(%5)
}
```

This is a very simple example, but it is worth noting that it is quite inefficent to flatten control flow completely.

Now that we've simplified our usage of the iterators into the above IR, we can easily scan through it and mark boundaries where concurrency can be implemented, then where the concurrent parts need to be rejoined.

# Early break inference

There is an issue though. We can split from sequential to concurrent execution right after `%1 = input.pop()`. Concurrency, however, works by spawning the next statement asynchronously and continuing to the next iteration of the loop. As `%1` will be set to `Option::None` if there are no more items in the array, it will keep spawning new tasks forever.

This is where early break inference comes in. Using some basic analysis, we determine when the loop _would_ break.

A break occurs if `%5 == null`, which will happen if `%3 == null || %4 == null`, which will happen if `%2 == null`, which will happen if `%1 is None`. In this case, we could trace the break back to the last sequential statement (which is the ideal case), but if we couldn't, we'd have to move the start of concurrency to the statement were we could infer the break.

An example of this would be if the user put a `.filter` before the `.map` in the initial iterator chain: the final break condition would evaluate to something like `%1 is Option::None || %3 is Option::none`. In this case, we could convert the tree into two loops, with the first one breaking at `%1 is Option::None` and the second loop breaking at `%3 is Option::None`, allowing `%2` to be run concurrently.

# Creating tasks

After early break inference (and some optimization to remove some newly unreachable code) we can map out where the task boundaries would be, and which tasks can run concurrently.

```rust
inputs = resolve_inputs()
collected = Vec::new()

loop:
    // Task1
    //
    // Cannot be concurrent because `inputs` is mutated.
    %1 = inputs.pop()
    if(%1 is Option::None):
        break

    // Task2 (Task1)
    //
    // Could be concurrent. If all the %1's we're provided this would be safe
    // to do concurrently
    %2 = drained_input.0

    // Task3 (Task2)
    //
    // Can be concurrent because `cache` is not mutated.
    %3 = cache.get(%2.id())

    // Task4 (Task2, Task3)
    //
    // Assuming %2 is provided, we could run this concurrently
    %4 = null
    if(%3 is Option::None):
        %4 = %2.expensive() // ... expensive stuff

    // Task5 (Task3, Task4)
    //
    // Cannot run this concurrently because `cache` is mutated. All the concurrent
    // items of %4 would would have to be joined back
    if(%3 is Option::None):
            cache.set(input.id(), %4.clone())

    // Task6 (Task3, Task4)
    //
    // Assuming %3 and %4 are provided, this can be run concurrently
    %5 = %3
    if(%3 is Option::None):
        %5 = %4

    // Task7 (Task6)
    //
    // Cannot be concurrent because `collected` is mutated
    collected.push(%5)
}
```

From the results of this scan, we can construct a graph, noting which tasks depend on which, where the sequential execution can split into concurrent execution, and where the concurrent execution must be joined back into sequential execution.

```
Task1 Split(n)
  -> Task2(n)
    -> Task3(n)
            -> Task4(n)
                -> Join Task5
                -> Task6(n)
                    -> Join Task7
```

`Split` refers to a point where the loop can spawn a task for the next statement, and continue to the next iteration of the loop. `Join` refers to a point where all previous iterations of the loop (for statements up to that point) must have completed in order to run.

Notice that `Task5` is not depended upon by another task. It performs a side effect with cloned data, so there is no necessity that tasks such as this be done in a huge hurry. This is an opportunity for a runtime to speed things up by prioritizing tasks with more dependencies, giving the illusion of greater speed.

Something else to consider is each of the joins need to be notified when their dependencies have been met. This can be done by having the splitting task be the task that creates the join, notifying it of the number of dependencies it can expect to receive.

We can now compute a slightly more verbose IR than before, having a more ergonomic representation in terms of the individual tasks and their dependencies.

```rust
inputs = resolve_inputs()
collected = Vec::new()

T1(inputs, collected):
    create:
        @5 = T5()
        @7 = T7(collected)
    split:
        do:
            %1 = inputs.pop()
        break if:
            %1 is Option::None
        increment:
            @5
            @7
        spawn:
            T2(%1, @7)

T2(%1, @5, @7):
    do:
        %2 = drained_input.0
    spawn:
        T3(%2, @5, @7)

T3(%2, @5, @7):
    do:
        %3 = cache.get(%2.id())
    spawn:
        T4(%3, @5, @7)

T4(%3, @5, @7):
    do:
        %4 = null
        if(%3 is Option::None):
            %4 = %2.expensive() // ... expensive stuff
    provide:
        @5 with (%3, %4)
    spawn:
        T6(%3, %4, @7)

T5():
    join as (%3, %4):
        if(%3 is Option::None):
            cache.set(input.id(), %4.clone())

T6(%3, %4, @7):
    do:
        %5 = %3
        if(%3 is Option::None):
            %5 = %4
    provide:
        @7 with (%5)

T7(collected):
    join as (%5):
        collected.push(%5)
```

# Complexity filtering and task merging

In the above example, everything that can be run concurrently is run concurrently. This however, is not always optimal because of the runtime overhead associated with creating a queueing a task. Additionally, tasks that depend on one another should generally be merged together.

Perhaps a complexity number could be statically assigned to each kind of operation by the analyzer, and the IR would be walked outwards from a known task boundary as the complexity from each operation is summed. Once a certain threshold is reached, a task would be created.

Another option is to not create any task boundaries, but instead, track execution timestamps at each potential task boundary. The project tests could then be run, the execution timestamps monitored, and the task boundary points decided upon after. This approach has the benefit of examining intended application use-cases instead of static operation complexity numbers, which could differ from real usage, especially in loops where the number of iterations can only be known at runtime.

# Task Compression

Because of de-abstraction, large amounts of code are liable to be copied. To help minimize build sizes, similar tasks could be combined. Of course, if a task is identical, removing the duplicates is a no-brainer. If, however, there are two tasks which are similar, but not identical, the differing parts could be gated with logic. This could be based on a dev-provided setting, such as `--compression-aggression=<1-10>`. Developers might want to lean into compression at the expense of adding additional logic if a small build is important to their business constraints.

Here is an example of joining a fictional `Task1` and `Task2`, where both tasks share the same statement at the beginning, but only `Task2` has a second statement.

```rust
T1andT2(%identity):
    do:
        %1 = ...
        if(%identity is 2):
            ...
    spawn:
        T3(%1)
```

# Atomics and copy on write

In a lot of cases, the deep analysis outlined above can keep the insertion of task boundaries at optimal points, maintaining safety and optimizing performance. However, sometimes, application constraints require some one-off mutability in the middle of an otherwise perfectly concurrent task. An example of this is would be an http server, where each request handler is mostly isolated from the others, but when certain conditions are true, the endpoint my modify some global state.

In a case like this, some sort of atomic control, or if the situation permits, copy on write, would be more performant than running the request handler tasks sequentially or trying to join them for security on the off-chance that the global state is mutated.

The decision on if an atomic or copy on write should be used could be made using one of the processes described in the complexity filtering and task merging section.
