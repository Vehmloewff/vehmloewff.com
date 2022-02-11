import { sendEmail } from '../deps.ts'

const content = (id: string) => `\

It's great to have another subscriber! Whenever I publish a new blog post, you'll be notified!

I look forward to sharing my future posts with you!

God Bless,
Vehmloewff

Subscribed by accident?  Unsubscribe:

https://vehmloewff.com/subscriptions/${id}

`

export async function subscribedEmail(to: string, subscriptionId: string) {
	await sendEmail({
		content: content(subscriptionId),
		subject: 'Hooray! You have subscribed to Vehmloewff.com!',
		to,
	})
}
