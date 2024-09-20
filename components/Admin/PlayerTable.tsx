import Link from "next/link";

const PlayerTable = ({
  users,
  tournament,
  handlePlayerStatusChange,
  handleMakeWanted
}) => {
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
              {user.state == "ACTIVE" ? (
                <>
                  <td>
                    <button
                      onClick={() =>
                        handlePlayerStatusChange("DEAD", user.playerId)
                      }
                    >
                      Tapa
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleMakeWanted(user.playerId)}>
                      Etsintäkuuluta
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <button
                      onClick={() =>
                        handlePlayerStatusChange("ACTIVE", user.playerId)
                      }
                    >
                      Herätä henkiin
                    </button>
                  </td>
                  {user.state != "DETECTIVE" && (
                    <td>
                      <button
                        onClick={() =>
                          handlePlayerStatusChange("DETECTIVE", user.playerId)
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
