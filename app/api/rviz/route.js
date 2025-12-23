import { exec } from "child_process";

export async function POST() {
  exec(
    "bash -lc 'source /opt/ros/jazzy/setup.bash && rviz2'",
    (err, stdout, stderr) => {
      if (err) {
        console.error("RViz error:", err);
        console.error(stderr);
      }
    }
  );

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}
