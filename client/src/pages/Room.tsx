// import { useEffect, useRef } from "react";

// export default function Room() {
//   const wsRef = useRef(null);
//   useEffect(() => {
//     wsRef.current = new WebSocket("ws://localhost:3001");

//     wsRef.current.onopen = () => {
//       console.log("WebSocket connected");
//     };

//     wsRef.current.onmessage = (event) => {
//       setMessages((prev) => [...prev, event.data]);
//     };

//     wsRef.current.onclose = () => {
//       console.log("WebSocket disconnected");
//     };

//     return () => {
//       wsRef.current.close();
//     };
//   }, []);
//   return <div>Room Page</div>;
// }
