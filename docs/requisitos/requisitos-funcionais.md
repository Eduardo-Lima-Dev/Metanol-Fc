# Requisitos Funcionais — Metanol FC

- Status: em revisão
- Data: 2026-07-03

## RF01 — Cadastro e Login

- **RF01.1** O sistema deve permitir o cadastro de um novo usuário informando: nome (obrigatório), apelido (opcional), e-mail (obrigatório, único no sistema) e senha (obrigatória).
- **RF01.2** O sistema deve validar formato de e-mail e impor requisitos mínimos de senha (ex.: tamanho mínimo).
- **RF01.3** O sistema deve armazenar a senha de forma segura (hash, nunca em texto plano).
- **RF01.4** O sistema deve permitir login com e-mail e senha, retornando erro claro em caso de credenciais inválidas.
- **RF01.5** *(sugestão)* O sistema deve permitir edição dos dados de perfil (nome, apelido, senha) após o cadastro.

## RF02 — Gerenciamento de Rachas

- **RF02.1** O sistema deve permitir que um usuário crie um racha informando: nome (obrigatório), dia/horário (opcional).
- **RF02.2** O usuário que cria o racha se torna automaticamente seu administrador.
- **RF02.3** O sistema deve permitir que o administrador adicione ou remova participantes do racha.
- **RF02.4** O sistema deve permitir que um usuário participe de mais de um racha. Um racha começa com um único administrador (seu criador — RF02.2), que pode conceder unilateralmente o papel de administrador a outros participantes do racha (sem exigir aceite do promovido), passando a existir múltiplos administradores.
- **RF02.5** O sistema deve listar, para cada usuário, os rachas dos quais participa e/ou administra.

## RF03 — Jogadores

- **RF03.1** Todo participante de um racha é tratado como jogador, herdando os dados de usuário (RF01) e adicionando: média, gols, assistências.
- **RF03.2** Esses três atributos são específicos por racha (o mesmo usuário pode ter médias/gols/assistências diferentes em rachas diferentes). São adicionados pelos administradores do racha e exibidos publicamente para os jogadores dentro do racha.
- **RF03.3** Apenas os administradores do racha podem atualizar gols e assistências dos jogadores após cada partida.
- **RF03.4** A média do jogador é definida por duas fontes possíveis, com a avaliação pública prevalecendo como fonte de verdade:
  - **RF03.4.1** Upload de um arquivo `.txt` pelo administrador, contendo os jogadores e suas respectivas médias — usado como valor inicial/manual (ex.: para importar histórico anterior ao sistema).
  - **RF03.4.2** Uma aba/rota de avaliação de jogadores, pública dentro do racha, onde os jogadores atribuem notas a outros jogadores em uma escala de **0 a 5, admitindo valores decimais** (ex.: 2,5). O período em que essa avaliação fica aberta para preenchimento é controlado pelo administrador (abrir/fechar). Um jogador não pode avaliar a si mesmo, e não pode alterar sua nota depois de enviada. Quando há avaliações públicas para um jogador, sua média é calculada automaticamente como a **mediana** das notas recebidas (sem número mínimo de avaliações exigido), prevalecendo sobre o valor importado via `.txt`. Antes de existir qualquer avaliação pública para o jogador, o valor importado via `.txt` (RF03.4.1) vale como fallback da média.

## RF04 — Histórico de Times

- **RF04.1** Toda vez que uma divisão de times for gerada (RF05), o sistema deve persistir um registro contendo: data/hora de criação e a composição dos times gerados (lista de jogadores por time).
- **RF04.2** O sistema deve permitir consultar o histórico de divisões de um racha, ordenado por data.
- **RF04.3** *(sugestão)* O sistema deve permitir visualizar os parâmetros usados em cada divisão (nº de times, nº de jogadores por time), para rastreabilidade.

## RF05 — Divisão de Times via Algoritmo Genético

- **RF05.1** O sistema deve permitir que o administrador do racha inicie um processo de divisão de times, informando os jogadores presentes naquele dia.
- **RF05.2** Representação do indivíduo (cromossomo): um vetor de tamanho N (nº de jogadores presentes), onde a posição *i* representa o jogador *i* e o valor armazenado indica o time ao qual ele foi alocado.
- **RF05.3** População inicial: o sistema deve gerar aleatoriamente um conjunto de cromossomos (tamanho configurável), já respeitando o nº de jogadores por time definido em RF06.
- **RF05.4** Função de fitness: deve avaliar o quão equilibrados estão os times, minimizando a diferença de nível entre eles. Como o jogador tem 3 atributos (média, gols, assistências), a fitness deve combinar a diferença desses atributos entre os times — com peso configurável por atributo, para permitir priorizar, por exemplo, a média sobre gols/assistências.
- **RF05.5** Operadores genéticos:
  - Seleção dos pais (ex.: por torneio ou roleta);
  - Crossover entre cromossomos, seguido de uma etapa de correção para garantir que nenhum time fique com mais ou menos jogadores do que o permitido após o cruzamento;
  - Mutação por translocação (troca o time de dois jogadores dentro do mesmo cromossomo), preservando o nº de jogadores por time.
- **RF05.6** Parâmetros do algoritmo: tamanho da população, número de gerações, taxa de crossover e taxa de mutação devem ter valores padrão, mas idealmente configuráveis.
- **RF05.7** Retorno e persistência: ao final, o sistema deve apresentar ao admin os times formados (melhor cromossomo obtido) e registrar o resultado no histórico (RF04).

## RF06 — Parâmetros de Divisão

- **RF06.1** O usuário deve poder informar o número de times (K) desejado.
- **RF06.2** O usuário deve poder informar o número de jogadores por time.
- **RF06.3** Quando nº de times × nº de jogadores por time for menor que o total de jogadores presentes, os jogadores excedentes devem ser distribuídos um por time, até acabarem (round-robin), gerando times com tamanhos desiguais em no máximo 1 jogador de diferença entre si. Isso é necessário porque algoritmos genéticos desse tipo tendem a não lidar bem "nativamente" com times de tamanhos desiguais, exigindo tratamento à parte.
- **RF06.4** *(sugestão)* O usuário deve poder ajustar os pesos de média/gols/assistências usados na função de fitness (RF05.4), para casos avançados.

## Questões em aberto

Nenhuma pendência bloqueante no momento. Todos os pontos levantados na primeira revisão (RF02.4, RF03.2, RF03.3, RF03.4) foram decididos.
