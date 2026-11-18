// src/components/JoinButton.jsx
export default function JoinButton({ code }) {
  return (
    <a
      href={`/go/${code}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="join-btn"
    >
      Join Group
    </a>
  );
}