/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import OpenAI from "openai";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// receive POST information:
		var country;
		async function readBody(request: Request) {
			const contentType = request.headers.get("content-type");
			if (contentType?.includes("application/json")) {
				return JSON.stringify(await request.json());
			} else if (contentType.includes("application/text")) {
				return request.text();
			} else if (contentType.includes("text/html")) {
				return request.text();
			} else if (contentType.includes("form")) {
				const formData = await request.formData();
				const body = {};
				for (const entry of formData.entries()) {
					body[entry[0]] = entry[1];
				}
				return JSON.stringify(body);
			} else {
				// Perhaps some other type of data was submitted in the form
				// like an image, or some other binary data.
				// Then we search Canada!
				return "Canada";
			}
		}

		interface MyObj {
			country: string;
		}

		if (request.method === "POST") {
			const reqBody = await readBody(request);
			let yes: MyObj = JSON.parse(reqBody);
			country = `${yes.country}`;
			// return new Response(retBody);
			// const reqBody = await readBody(request);
			// const retBody = `${reqBody}`;
			// country = retBody;
		} else {
			country = "Canada";
		}
		var prompt = 'What are 5 ways that ' + country + ' is sustainable?';
		console.log(prompt);

		// Open AI portion:
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY
		});

		// make our request to the OpenAI API
		const stream = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: prompt }],
			stream: true,
		});

		// Using our readable and writable to handle streaming data
		let { readable, writable } = new TransformStream()

		let writer = writable.getWriter()
		const textEncoder = new TextEncoder();

		// loop over the data as it is streamed from OpenAI and write it using our writeable
		for await (const part of stream) {
			console.log(part.choices[0]?.delta?.content || '');
			writer.write(textEncoder.encode(part.choices[0]?.delta?.content || ''));
		}

		writer.close();

		// Send readable back to the browser so it can read the stream content
		return new Response(readable);
	},
};
