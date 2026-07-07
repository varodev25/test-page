// Bun server serving the Aurora proposal page
// Background color can be set via env variable BG_COLOR (default #030712c3)
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { hostname } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bgColor = Bun.env.BG_COLOR || "#030712";
const pkgVersion = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf8"),
).version;
const version = Bun.env.VERSION || pkgVersion;

console.log("Version: ", version);
console.log("BgColor: ", bgColor);
console.log("Port: ", Bun.env.PORT);

const isInsideContainer = () => {
  // 1. Check common container environment variables
  if (Bun.env.container || Bun.env.DOCKER_CONTAINER || Bun.env.KUBERNETES_SERVICE_HOST) {
    return true;
  }
  try {
    // 2. Check mount points or file flags
    if (existsSync("/.dockerenv") || existsSync("/.containerenv")) {
      return true;
    }
    
    // 3. Check cgroups for container indicators
    if (existsSync("/proc/self/cgroup")) {
      const cgroup = readFileSync("/proc/self/cgroup", "utf8");
      if (
        cgroup.includes("docker") ||
        cgroup.includes("kubepods") ||
        cgroup.includes("containerd") ||
        cgroup.includes("libpod")
      ) {
        return true;
      }
    }

    // 4. Check mountinfo for overlay fs or docker/podman directories
    if (existsSync("/proc/self/mounts")) {
      const mounts = readFileSync("/proc/self/mounts", "utf8");
      if (
        mounts.includes("overlay / overlay") ||
        mounts.includes("docker") ||
        mounts.includes("containerd") ||
        mounts.includes("podman")
      ) {
        return true;
      }
    }

    // 5. Check if running as init (PID 1) or child of init in non-standard systems
    if (process.pid === 1 || process.ppid === 0 || process.ppid === 1) {
      if (existsSync("/proc/1/comm")) {
        const comm = readFileSync("/proc/1/comm", "utf8").trim();
        if (comm !== "systemd" && comm !== "init" && comm !== "launchd") {
          return true;
        }
      }
    }
  } catch {
    // Fail-safe to false if reading files errors out (e.g. non-linux platform)
  }
  return false;
};

console.log('isInsideContainer', isInsideContainer())

const containerId = isInsideContainer() ? hostname() : "LOCAL";

// Preload HTML and inject background color and container ID
let rawHtml = readFileSync(resolve(__dirname, "index.html"), "utf8");
rawHtml = rawHtml.replace("{{BG_COLOR}}", bgColor);
rawHtml = rawHtml.replace("{{CONTAINER_ID}}", containerId);

Bun.serve({
  port: Number(Bun.env.PORT) || 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/ping") {
      const payload = { message: "¡Conexión exitosa!", version };
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    } else if (url.pathname === "/api/version") {
      const payload = { version };
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    }
    // Serve index.html for any other request
    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`🚀 Server listening on http://localhost:${Bun.env.PORT || 3000}`);
