import GroupCard from './GroupCard'
export default function GroupGrid({ groups }) { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{groups.map(g => <GroupCard key={g.id} group={g}/>)}</div> }
