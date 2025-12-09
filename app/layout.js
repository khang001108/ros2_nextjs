export const metadata = {
  title: "ROS Web",
  description: "ROS2 + NextJS Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
