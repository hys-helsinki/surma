import Link from "next/link";
import { useState } from "react";

const PlayerTable = ({ userList, tournament, handleMakeWanted }) => {
  const [users, setUsers] = useState(userList);

  const handlePlayerStatusChange = async (playerState, id) => {
    const data = { state: playerState };
    const res = await fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const updatedUser = await res.json();
    setUsers(users.map((user) => (user.player.id !== id ? user : updatedUser)));
  };

  if (users.length === 0) return <p>Ei pelaajia</p>;

  return (
    <div style={{ paddingLeft: "10px" }}>
      <h3>Pelaajat</h3>
      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <Link href={`/tournaments/${tournament.id}/users/${user.id}`}>
                  <a>
                    {user.firstName} {user.lastName} ({user.player.alias})
                  </a>
                </Link>
              </td>
              {user.player.state == "ACTIVE" ? (
                <>
                  <td>
                    <button
                      onClick={() =>
                        handlePlayerStatusChange("DEAD", user.player.id)
                      }
                    >
                      Tapa
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleMakeWanted(user.player.id)}>
                      Etsintäkuuluta
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <button
                      onClick={() =>
                        handlePlayerStatusChange("ACTIVE", user.player.id)
                      }
                    >
                      Herätä henkiin
                    </button>
                  </td>
                  {user.player.state != "DETECTIVE" && (
                    <td>
                      <button
                        onClick={() =>
                          handlePlayerStatusChange("DETECTIVE", user.player.id)
                        }
                      >
                        Etsiväksi
                      </button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
