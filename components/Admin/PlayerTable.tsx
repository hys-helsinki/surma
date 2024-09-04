import Link from "next/link";

const PlayerTable = ({ players, tournament, handlePlayerStatusChange }) => {
  return (
    <div style={{ paddingLeft: "10px" }}>
      <h2>Pelaajat</h2>
      <table>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  <a>
                    {player.user.firstName} {player.user.lastName} (
                    {player.alias})
                  </a>
                </Link>
              </td>
              {player.state == "ACTIVE" ? (
                <td>
                  <button
                    onClick={() => handlePlayerStatusChange("DEAD", player.id)}
                  >
                    Tapa
                  </button>
                </td>
              ) : (
                <>
                  <td>
                    <button
                      onClick={() =>
                        handlePlayerStatusChange("ACTIVE", player.id)
                      }
                    >
                      Herätä henkiin
                    </button>
                  </td>
                  {player.state != "DETECTIVE" && (
                    <td>
                      <button
                        onClick={() =>
                          handlePlayerStatusChange("DETECTIVE", player.id)
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
