// Matriz de permissões — vem de "Permissões e dados.dc.html", é regra de negócio fixa,
// não dado do banco. 0 = bloqueado, 1 = só sobre si mesmo, 2 = permitido.
const MATRIZ = [
  ['Criar e apagar o grupo', 2, 0, 0],
  ['Promover ou rebaixar admin', 2, 0, 0],
  ['Editar nome, cidade e link do grupo', 2, 2, 0],
  ['Marcar, editar e cancelar jogo', 2, 2, 0],
  ['Definir custo da quadra e vagas', 2, 2, 0],
  ['Confirmar presença no jogo', 1, 1, 1],
  ['Tirar outro jogador da lista', 2, 2, 0],
  ['Sortear os times', 2, 2, 2],
  ['Trocar jogador de time depois do sorteio', 2, 2, 1],
  ['Declarar que pagou', 1, 1, 1],
  ['Confirmar pagamento recebido', 2, 2, 0],
  ['Editar o nível de um jogador', 2, 2, 0],
  ['Ver histórico de faltas', 2, 2, 0],
  ['Convidar por link', 2, 2, 2],
  ['Remover membro do grupo', 2, 2, 0],
  ['Sair do grupo', 0, 2, 2],
]

const COLUNA_POR_PAPEL = { dono: 1, admin: 2, jogador: 3 }

const RESUMOS = {
  dono: 'Manda em tudo, incluindo promover ou remover outros admins e apagar o grupo.',
  admin: 'Auxiliar da pelada. Faz tudo do dia a dia, menos mexer em quem manda.',
  jogador: 'Confirma presença, sorteia times e cuida do próprio pagamento.',
}

export function capacidadesDoPapel(papel) {
  const col = COLUNA_POR_PAPEL[papel]
  return {
    resumo: RESUMOS[papel],
    itens: MATRIZ.map((linha) => ({ acao: linha[0], permitido: linha[col] > 0 })),
  }
}
