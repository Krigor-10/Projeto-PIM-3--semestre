# CodeRyse Academy — Protótipo Frontend PIM 3

Protótipo de interface desenvolvido como Projeto Integrado Multidisciplinar (PIM 3) da UNIP.
Simula o painel acadêmico de uma plataforma de ensino digital com controle de acesso por perfil.

---

## Tecnologias

| Biblioteca | Versão | Uso |
|---|---|---|
| React | 19 | UI e gerenciamento de estado |
| Vite | 8 | Build tool e servidor de desenvolvimento |
| React Router DOM | 7 | Navegação entre telas |
| React Icons | 5 | Ícones (Tabler + Material Design) |
| Framer Motion | 12 | Animações e transições |
| Recharts | 3 | Gráficos no dashboard admin |

> Sem backend — dados simulados via `localStorage` (camada `db.js`).

---

## Perfis de acesso

| Perfil | Usuário demo | Acesso |
|---|---|---|
| **Admin** | Krigor de Sousa | Controle total da plataforma |
| **Coordenador** | Nicolas Pimentel | Gestão de cursos, turmas, alunos e professores |
| **Professor** | Heitor Henrique Nadir | Conteúdos, quizzes e avaliações |
| **Aluno** | Maria Isabela Branco | Matrículas, conteúdos, avaliações e progresso |

---

## Funcionalidades por perfil

**Aluno**
- Dashboard com progresso e atalhos rápidos
- Catálogo de cursos com solicitação de matrícula
- Conteúdos por módulo com quiz interativo
- Avaliações com feedback imediato por questão
- Tela de progresso com barras por módulo
- Certificados com visualização e impressão

**Professor**
- Gerenciamento de conteúdos por turma
- Criação e edição de quizzes por módulo
- Publicação e controle de avaliações
- Visualização de desempenho dos alunos

**Coordenador**
- CRUD de cursos, módulos e turmas
- Aprovação de matrículas (individual e em massa)
- Gestão de professores e alunos

**Admin**
- Dashboard com KPIs e gráfico de atividade
- Controle de visibilidade do catálogo público
- Gestão de todos os usuários da plataforma

---

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

Acesse `http://localhost:5173` após iniciar o servidor.

> Para resetar os dados ao estado inicial: abra o console do navegador e execute `localStorage.clear(); location.reload()`.

---

## Estrutura do projeto

```
src/
├── ativos/          # Imagens dos cursos e banner
├── componentes/     # Componentes reutilizáveis (Modal, Botao, Toast...)
├── dados/           # Camada de dados: mock, db (localStorage), permissões, quiz
├── estilos/         # Tokens CSS, estilos globais e estilos por página
├── hooks/           # Hooks customizados (useFocusTrap)
├── impressao/       # Template HTML para impressão de certificados
└── paginas/
    ├── academico/   # Cursos, Módulos, Turmas, Matrículas, Avaliações, Conteúdos
    ├── aprendizado/ # Progresso, Certificados, Quiz, Catálogo
    ├── autenticacao/# Início, Login, Cadastro
    ├── dashboard/   # Dashboard por perfil (Aluno, Professor, Coordenador, Admin)
    ├── perfil/      # Perfil do usuário
    └── usuarios/    # Alunos, Professores, Coordenadores
```

---

## Arquitetura

- **Controle de acesso (RBAC):** `dados/permissoes.js` define quais seções cada perfil pode acessar e quais ações pode executar (criar, editar, excluir)
- **Persistência:** `dados/db.js` abstrai o `localStorage` como banco de dados, com entidades para matrículas, módulos, turmas, progresso e questões
- **Design system:** tokens CSS em `estilos/variaveis.css` com tema escuro, tipografia e escala de espaçamento consistentes
- **Acessibilidade:** WCAG 2.1 AA — skip link, focus trap em modais, contraste validado, aria-labels e roles semânticos

---

## Desenvolvido por

**Krigor Nasare** — Análise e Desenvolvimento de Sistemas, UNIP
PIM 3 — 3º Semestre · 2025
