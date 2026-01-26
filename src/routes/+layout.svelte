<script>
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ব্যালট পাঁচালী - নির্বাচনী সচেতনতার খেলা</title>
	<meta name="description" content="বাংলাদেশের নির্বাচনী সচেতনতা বাড়াতে একটি মাল্টিপ্লেয়ার বোর্ড গেম" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

{@render children()}
