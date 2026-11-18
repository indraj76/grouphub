// Opens the group's Telegram invite link. Use anywhere a group object with inviteLink is available.
export default function JoinButton({ group, className = 'btn-primary', children = 'Join on Telegram' }) {
  if (!group?.inviteLink) return null
  return (
    <a href={group.inviteLink} target="_blank" rel="noopener noreferrer" className={`${className} inline-block text-center`}>
      {children}
    </a>
  )
}
