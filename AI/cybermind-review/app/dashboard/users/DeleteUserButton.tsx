"use client";

export default function DeleteUserButton({
id,
}: {
id: string;
}) {
async function deleteUser() {
const confirmed = confirm(
"Delete this user?"
);


if (!confirmed) return;

const res = await fetch(`/api/users/${id}`, {
  method: "DELETE",
});

if (res.ok) {
  location.reload();
} else {
  alert("Delete failed");
}


}

return ( <button onClick={deleteUser}>
Delete </button>
);
}
