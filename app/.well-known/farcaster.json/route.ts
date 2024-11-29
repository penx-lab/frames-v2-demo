export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjc4ODE0NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEQyMDIzOUI5NGJjQ2FhMzM2MzVhRDdiNTFBZmU5OWEzMDAyMTE2MzQifQ",
      payload: "eyJkb21haW4iOiJmcmFtZS5wZW54LmlvIn0",
      signature:
        "MHgzMTM0MmE5YWE5ZjUwMWU5YzliNDk1ODM3OGM4MDNlYWRhNjg1YzdmZGUxNGU0MGUxYWYwYzY5ZDdlNWQ3ODU1NmU1NDk3NTI3ZWQ0NzI5MDgzOTMyMTdlMzhmNDc5Nzc5Yjc2YzliYWMxODhiOGViY2U2ZmUzZjJhY2M1ZmZlZDFi",
    },
    frame: {
      version: "0.0.0",
      name: "Frames v2 Demo",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      homeUrl: appUrl,
    },
  };

  return Response.json(config);
}
