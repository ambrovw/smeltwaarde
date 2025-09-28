export default function UserDetails({ user }) {
    if (!user) return <div>Geen gebruiker ingelog nie.</div>;

    return (
        <div>
            <h2>Gebruiker Inligting</h2>
            <p><strong>Naam:</strong> {user.name}</p>
            <p><strong>E-pos:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
        </div>
    );
}