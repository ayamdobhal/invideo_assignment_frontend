# invideo_assignment_frontend

The frontend repository for Invideo Assignment. Built using Next.JS.
The UI has two tabs:

1. A calculator that evaluates expressions using the [WebAssembly Bindings](https://github.com/ayamdobhal/invideo-assignment-wasm), the bindings are also included as a submodule.
2. A Shader Editor where the user can prompt for a GLSL shader and the code is fetched from `gemini-1.5-flash` model and is previewed as well.

## Set up

1. Clone the Repository

```bash
git clone https://github.com/ayamdobhal/invideo_assignment_frontend
cd invideo_assignment_frontend
```

2. Install the dependencies

```bash
pnpm install
```

3. Set up the Environment

```bash
cp .env.example .env
```

5. Clone and run the backend server from [here](https://github.com/ayamdobhal/invideo_assignment_backend)
6. Run the development server

```bash
pnpm run dev
```

The server can then be accessed at: [http://localhost:3000](https://localhost:3000)
