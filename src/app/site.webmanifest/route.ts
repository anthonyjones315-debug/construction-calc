export function GET(request: Request) {
  return Response.redirect(new URL("/app.webmanifest", request.url), 307);
}
