<script lang="ts">
	import type {ColorScheme} from "../common.ts"
    import { getContext } from 'svelte';

	const colorScheme: ColorScheme = getContext("colorScheme")!;

	let borderColor = new Map<ColorScheme, string>([["light", "black"], ["dark", "white"]]).get(colorScheme)!
	let backgroundColor = new Map<ColorScheme, string>([["light", "white"], ["dark", "black"]]).get(colorScheme)!

</script>

<main>
	<div class="riichi" style=" border: .1vmin solid {borderColor}; background-color: {backgroundColor}; "><span class="dot">🔴</span></div>
</main>

<style>
.riichi {
		display: flex;
		width: 15vmin;
		height: 2vmin;
		border-radius: 1vmin;
		justify-content: center;
		align-items: center;
		font-size: 1.4vmin;
	}
.dot {
	transform: translateY(.1vmin)
}
</style>
