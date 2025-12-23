export const metadata = {
  title: "ROS Web Dashboard",
  description: "AGV Control Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d1117", color: "white" }}>
        {children}
      </body>
    </html>
  );
}
