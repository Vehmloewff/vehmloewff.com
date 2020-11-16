<style>
	div {
		background: var(--primary);
		animation: flip 1.2s ease infinite;
		height: 30px;
		width: 30px;
	}

	@keyframes flip {
		0% {
			transform: perspective(120px) rotateX(0deg) rotateY(0deg);
		}
		50% {
			transform: perspective(120px) rotateX(-180deg) rotateY(0deg);
		}
		100% {
			transform: perspective(120px) rotateX(-180deg) rotateY(-180deg);
		}
	}
</style>

<div />
