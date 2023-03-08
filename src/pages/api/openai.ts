import { NextRequest } from "next/server";

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  console.log('req.method', req.method)
  console.log('req.url', req.url)
  let method = req.method
  let url = new URL(req.url)
  let urlHostname = url.hostname
  url.protocol = 'https:'
  url.host = 'api.openai.com'
  url.pathname = '/v1/chat/completions'

  let reqHeaders = req.headers
  let newReqHeaders = new Headers(reqHeaders)
  newReqHeaders.set('HOST', url.host)
  newReqHeaders.set('Referer', url.protocol + '//' + urlHostname)

  let originalRes = await fetch(url.href + '/v1/chat/completions', {
    method,
    headers: newReqHeaders,
    body: req.body
  })

  let originalResClone = originalRes.clone()
  let originalText
  let resHeaders = originalRes.headers
  let newResHeaders = new Headers(resHeaders)
  let status = originalRes.status

  newResHeaders.set('Cache-Control', 'no-store');
  newResHeaders.set('access-control-allow-origin', '*');
  newResHeaders.set('access-control-allow-credentials', 'true');
  newResHeaders.delete('content-security-policy');
  newResHeaders.delete('content-security-policy-report-only');
  newResHeaders.delete('clear-site-data');

  originalText = originalResClone.body

  return new Response(originalText, {
    status,
    headers: newResHeaders
  })
  
}

