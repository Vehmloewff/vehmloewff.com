import { registerModel } from './deps.ts'

export interface Subscriber {
	id: string
	email: string
	postsViewed: string[]
	postsNotified: string[]
}

export const Subscriber = await registerModel<Subscriber>('Subscriber')

export interface Post {
	id: string
	title: string
	description: string
	searchable: boolean
	topics: string[]
	html: string
	date: string
	reads: number
}

export const Post = await registerModel<Post>('Post')

export interface Comment {
	id: string
	author: string
	authorEmail: string
	text: string
	postId: string
}

export const Comment = await registerModel<Comment>('Comment')
