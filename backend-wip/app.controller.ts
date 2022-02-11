import { Context, UserError, sendEmail } from './deps.ts'
import { Post, Subscriber } from './app.cluster.ts'
import { subscribedEmail } from './emails/subscribed.ts'

//
// Posts
//

export async function setPost(
	context: Context,
	post: {
		id: string
		title: string
		description: string
		searchable: boolean
		topics: string[]
		html: string
		date: string
	}
) {
	const user = await context.getUser()
	if (!user.isAdmin) return

	const currentPost = await Post.get(post.id)
	if (!currentPost) await Post.insert({ ...post, reads: 0 })
	else await Post.update({ ...post, reads: currentPost.reads })
}

export async function getPost(_: Context, id: string): Promise<{ title: string; description: string; date: string; html: string }> {
	const post = await Post.get(id)
	if (!post) throw new UserError('Post does not exist')

	return {
		title: post.title,
		description: post.description,
		date: post.date,
		html: post.html,
	}
}

export async function getTrendingPosts() {}

//
// Subscriptions
//

export async function subscribe(_: Context, email: string) {
	// Check if this email has already been subscribed
	{
		for await (const subscription of Subscriber.all())
			if (subscription.email === email) throw new UserError(`${email} has already been subscribed`)
	}

	const id = crypto.randomUUID()
	await Subscriber.insert({ postsNotified: [], postsViewed: [], email, id })

	await subscribedEmail(email, id)
}

export async function unsubscribe(_: Context, id: string) {
	await Subscriber.remove(id)
}

export async function viewSubscription(
	context: Context,
	id: string
): Promise<{ email: string; postsNotified: string[]; postsViewed: string[] }> {
	const user = await context.getUser()
	if (!user.isAdmin) throw new UserError('only admin users can access subscription details')

	const subscription = await Subscriber.get(id)
	if (!subscription) throw new UserError('Subscription does not exist')

	return {
		email: subscription.email,
		postsNotified: subscription.postsNotified,
		postsViewed: subscription.postsViewed,
	}
}

export async function getAllSubscriptions(context: Context): Promise<string[]> {
	const user = await context.getUser()
	if (!user.isAdmin) throw new UserError('Only admins are allowed to access all the subscriptions')

	return await Subscriber.getAllIds()
}

export async function notifySubscriberViewedPost(_: Context, params: { subscriptionId: string; postId: string }) {
	const subscription = await Subscriber.get(params.subscriptionId)
	if (!subscription) throw new UserError('Subscription does not exist')

	if (!(await Post.has(params.postId))) throw new UserError(`Post ${params.postId} does not exist`)

	subscription.postsViewed.push(params.postId)

	await Subscriber.update(subscription)
}

//
// Comments
//

// export async function
