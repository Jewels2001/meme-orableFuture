
## Code deployed on CloudFlare Workers

`workerOpenAIAPI.js` contains:
 - Retrieval (from POST) of request containing country information
 - `curl -H "Content-Type: application/json" -X POST -d '{"country":"Canada"}' https://worker-greenglobe2.juliewq25.workers.dev/`   
 - OpenAI API prompt: "What are 5 ways that X is sustainable?" where X is the country
 - Returns the response containing the stream from OpenAI API

Hosted on: [Cloudflare](https://worker-greenglobe2.juliewq25.workers.dev/)


__Current Issues__
- Does not link to application due to CORS [Cross-Origin Resource Sharing](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/cors/)


Other:
- [Figma](https://www.figma.com/proto/Xc9SPOaidGRyENDfSi9dNs/World-Map-(Community)?type=design&node-id=215-20&t=gyaXzDWPDmYzoYQq-1&scaling=contain&page-id=0%3A1&starting-point-node-id=215%3A20&mode=design)
- [PowerPoint](https://onedrive.live.com/edit.aspx?resid=83CC5AF276545740!288163&ithint=file%2cpptx&wdo=2&authkey=!ANhpFwQREpXQb8o)
- [Main website on cloudflare)](https://newtest.greenglobe.pages.dev/)
- [Devpost](https://devpost.com/software/greenglobe-17u30a)
