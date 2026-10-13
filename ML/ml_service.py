from http.server import BaseHTTPRequestHandler, HTTPServer
import json

from recommendation_engine import RecommendationEngine


HOST = "127.0.0.1"
PORT = 8000

engine = RecommendationEngine()


class Handler(BaseHTTPRequestHandler):

    def send_json(self, status_code, data):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status_code)

        self.send_header(
            "Content-Type",
            "application/json"
        )

        self.send_header(
            "Content-Length",
            str(len(response))
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        )

        self.end_headers()

        self.wfile.write(response)


    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        )
        self.end_headers()


    def do_GET(self):

        if self.path == "/health":
            self.send_json(
                200,
                {
                    "ok": True,
                    "service": "cinematch-ml"
                }
            )

            return

        self.send_json(
            404,
            {
                "error": "Not found"
            }
        )


    def do_POST(self):

        if self.path not in ["/recommendations/new-user", "/recommendations"]:
            self.send_json(
                404,
                {
                    "error": "Not found"
                }
            )

            return

        try:
            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )

            body = self.rfile.read(
                content_length
            )

            try:
                payload = json.loads(
                    body.decode("utf-8")
                )
            except Exception as parse_err:
                self.send_json(
                    400,
                    {
                        "error": f"Invalid JSON payload: {str(parse_err)}"
                    }
                )
                return

            ratings = payload.get(
                "ratings",
                {}
            )

            top_k = payload.get("top_k", 10)
            try:
                top_k = max(1, min(50, int(top_k)))
            except (ValueError, TypeError):
                top_k = 10

            recommendations = (
                engine.recommend_for_new_user(
                    ratings,
                    top_k=top_k
                )
            )

            self.send_json(
                200,
                {
                    "recommendations":
                        recommendations
                }
            )

        except Exception as error:

            print(
                "ML error:",
                error
            )

            self.send_json(
                500,
                {
                    "error":
                        str(error)
                }
            )


if __name__ == "__main__":

    print(
        f"CineMatch ML service running on "
        f"http://{HOST}:{PORT}"
    )

    server = HTTPServer(
        (HOST, PORT),
        Handler
    )

    server.serve_forever()