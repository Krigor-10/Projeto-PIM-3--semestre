# CodeRyse Academy — Documentação Técnica Completa

**Projeto:** Protótipo de Plataforma de Ensino Digital  
**Disciplina:** Projeto Integrado Multidisciplinar III (PIM 3)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** UNIP — Universidade Paulista  
**Desenvolvedor:** Krigor Nasare — krigor.nasare@aluno.unip.br  
**Versão:** 1.0.0  

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Linguagens de Programação](#2-linguagens-de-programação)
3. [Tecnologias e Ferramentas](#3-tecnologias-e-ferramentas)
4. [Bibliotecas Utilizadas](#4-bibliotecas-utilizadas)
5. [Arquitetura da Aplicação](#5-arquitetura-da-aplicação)
6. [Organização das Pastas](#6-organização-das-pastas)
7. [Banco de Dados — localStorage](#7-banco-de-dados--localstorage)
8. [Controle de Acesso (RBAC)](#8-controle-de-acesso-rbac)
9. [Sistema de Rotas](#9-sistema-de-rotas)
10. [Componentes Reutilizáveis](#10-componentes-reutilizáveis)
11. [Páginas e Telas](#11-páginas-e-telas)
12. [Sistema de Estilos](#12-sistema-de-estilos)
13. [Responsividade](#13-responsividade)
14. [Dados Mock](#14-dados-mock)
15. [Fluxo de Autenticação](#15-fluxo-de-autenticação)
16. [Acessibilidade](#16-acessibilidade)

---

## 1. Visão Geral do Projeto

O **CodeRyse Academy** é um protótipo funcional de plataforma de ensino digital (EAD) desenvolvido inteiramente no frontend, sem servidor ou banco de dados real. A aplicação simula um sistema acadêmico completo com quatro perfis de usuário — Aluno, Professor, Coordenador e Administrador — cada um com painéis, permissões e funcionalidades próprias.

O objetivo do protótipo é demonstrar, em uma apresentação acadêmica, a viabilidade e a lógica de um sistema EAD completo, incluindo gestão de cursos, matrículas, avaliações, progresso e emissão de certificados.

**O que a plataforma oferece:**

- Painel personalizado por perfil (dashboard com métricas e estatísticas)
- Catálogo público de cursos com visibilidade controlada pelo administrador
- Gestão completa de usuários: alunos, professores e coordenadores
- Gestão acadêmica: cursos, módulos, turmas e conteúdos
- Fluxo de matrículas com aprovação/rejeição
- Quiz interativo com timer e correção automática
- Acompanhamento de progresso por módulo e curso
- Emissão de certificados digitais para cursos concluídos
- Alternância entre tema escuro e claro
- Interface responsiva para desktop e mobile

---

## 2. Linguagens de Programação

| Linguagem | Uso no Projeto |
|-----------|---------------|
| **JavaScript (ES2022+)** | Linguagem principal da aplicação. Toda a lógica de negócio, gerenciamento de estado, roteamento, manipulação de dados e interatividade são escritos em JavaScript moderno com recursos como arrow functions, destructuring, spread operator, optional chaining, módulos ES (import/export) e async/await. |
| **JSX** | Extensão sintática do JavaScript usada pelo React. Permite escrever estruturas de interface semelhantes a HTML dentro dos arquivos `.jsx`, que são compiladas para chamadas `React.createElement()` pelo Vite durante o build. |
| **CSS3** | Linguagem de estilização. Toda a aparência visual da aplicação é construída em CSS puro — sem Tailwind, Bootstrap ou CSS-in-JS. Utiliza recursos modernos como variáveis CSS (custom properties), `calc()`, `clamp()`, `color-mix()`, Grid Layout, Flexbox, animações com `@keyframes` e media queries para responsividade. |
| **HTML5** | Estrutura base da aplicação (arquivo `index.html`). Inclui meta tags semânticas, Open Graph para compartilhamento social, Twitter Cards, configurações de SEO e o ponto de montagem do React (`<div id="raiz">`). |

---

## 3. Tecnologias e Ferramentas

### Ambiente de Desenvolvimento

| Ferramenta | Versão | Finalidade |
|-----------|--------|-----------|
| **Node.js** | ≥ 18.x | Ambiente de execução para o Vite e o npm |
| **npm** | ≥ 9.x | Gerenciador de pacotes e scripts de build |
| **Vite** | latest | Bundler e servidor de desenvolvimento. Fornece HMR (Hot Module Replacement), build otimizado para produção e suporte a módulos ES nativos |
| **Git** | — | Controle de versão com histórico de commits semânticos |
| **VS Code / Claude Code** | — | Editor e assistente de desenvolvimento |

### Configuração do Vite (`vite.config.js`)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "./src" }  // permite imports como @/componentes/Botao
  }
});
```

O alias `@` aponta para a pasta `src/`, eliminando caminhos relativos longos como `../../componentes/` e tornando os imports mais legíveis e portáveis.

### Scripts Disponíveis

| Comando | Ação |
|---------|------|
| `npm run dev` | Inicia o servidor de desenvolvimento em `localhost:5173` com HMR |
| `npm run build` | Gera a build de produção otimizada na pasta `dist/` |
| `npm run preview` | Serve localmente a build de produção para validação |

---

## 4. Bibliotecas Utilizadas

| Biblioteca | Versão | Finalidade |
|-----------|--------|-----------|
| **React** | latest (19.x) | Biblioteca principal de UI. Gerencia a árvore de componentes, estado local (`useState`), efeitos colaterais (`useEffect`) e referências DOM (`useRef`). |
| **React DOM** | latest (19.x) | Responsável por montar a árvore de componentes React na DOM do navegador através de `createRoot`. |
| **React Router DOM** | ^7.15.1 | Roteamento client-side (SPA). Gerencia a navegação entre páginas sem recarregar o browser, usando `BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useParams` e rotas protegidas customizadas. |
| **Framer Motion** | ^12.38.0 | Animações declarativas e fluidas. Usado nos botões (`Botao.jsx`) com animações de pressão (`whileTap`), escala e transições baseadas em física. Também utilizado para transições de entrada de tela. |
| **React Icons** | ^5.6.0 | Biblioteca de ícones SVG. O projeto usa exclusivamente o conjunto **Tabler Icons** (`react-icons/tb`), com mais de 60 ícones diferentes espalhados pela interface (sidebar, topbar, páginas, modais). |
| **Recharts** | ^3.8.1 | Biblioteca de gráficos baseada em SVG e React. Utilizada nos dashboards para exibir gráficos de barras, linhas e áreas referentes a progresso acadêmico, desempenho de turmas e métricas da plataforma. |
| **@vitejs/plugin-react** | latest | Plugin oficial do Vite que habilita o suporte a JSX, Fast Refresh e transformações React no processo de build. |

---

## 5. Arquitetura da Aplicação

### Tipo de Aplicação

**SPA — Single Page Application** (Aplicação de Página Única)

O projeto é uma SPA pura: o browser carrega um único arquivo HTML e toda a navegação é gerenciada pelo React Router no lado do cliente. Não há servidor web, não há API REST, não há banco de dados externo. Toda a persistência de dados acontece no `localStorage` do próprio browser.

### Padrão de Componentes

A aplicação segue o padrão **Composição de Componentes** do React:

```
Aplicacao.jsx                  ← root: autenticação + roteamento principal
└── LayoutWorkspace.jsx        ← layout pós-login: estado global, mapa de telas
    ├── BarraLateral.jsx       ← sidebar de navegação (fixa, colapsável)
    ├── BarraTopo.jsx          ← topbar fixa (breadcrumb, tema, perfil)
    │   └── NavGrupo.jsx       ← tabs de navegação por grupo (quando aplicável)
    ├── <ComponenteTela />     ← tela ativa (resolvida dinamicamente por rota)
    ├── Toast.jsx              ← sistema de notificações global
    └── BarraNavMobile.jsx     ← barra de navegação inferior (mobile)
```

### Gerenciamento de Estado

Não há biblioteca de gerenciamento de estado global (sem Redux, Zustand ou Context API). O estado é gerenciado de duas formas:

**Estado local (`useState`):** cada componente gerencia seu próprio estado de UI (modais abertos, filtros, formulários).

**Estado elevado (`LayoutWorkspace`):** dados compartilhados entre múltiplas telas são mantidos no componente pai (`LayoutWorkspace.jsx`) e passados como props:

- `listaCursos` / `onListaCursosChange` — cursos compartilhados entre TelaCursos, TelaModulos e TelaTurmas
- `quizzesAprovados` / `onQuizAprovado` — progresso de quizzes entre TelaConteudos, TelaAvaliacoes e TelaProgresso
- `avaliacaoAprovada` / `onAvaliacaoAprovada` — resultado de avaliação
- `conteudoConcluido` / `onConteudoConcluido` — flag de conclusão de conteúdo
- `onToast` — função global para exibir notificações

### Controle de Acesso (RBAC)

O controle de permissões é implementado em `src/dados/permissoes.js` como um sistema **RBAC — Role-Based Access Control**. Cada seção da aplicação tem uma lista de perfis com acesso, e o `LayoutWorkspace` bloqueia o acesso a rotas não autorizadas exibindo a tela `TelaAcessoNegado`.

---

## 6. Organização das Pastas

```
Prototipo-frontendPIM3/
│
├── index.html                    # HTML base com meta tags SEO e Open Graph
├── package.json                  # Dependências e scripts npm
├── vite.config.js                # Configuração do bundler Vite
│
├── Diagramas/                    # Diagramas do projeto (ER, MER, Classes)
│   ├── diagramaER.html
│   ├── diagramaMER.html
│   └── diagramaClasses.html
│
└── src/                          # Todo o código-fonte da aplicação
    │
    ├── principal.jsx             # Entry point — monta o React na DOM
    ├── Aplicacao.jsx             # Root — autenticação, sessão, rotas principais
    ├── rotas.js                  # Constantes de rotas e helper rotaPainelSecao()
    │
    ├── ativos/                   # Imagens estáticas
    │   ├── banner-home.png
    │   ├── certificado-fundo.png
    │   ├── curso-ciencia-dados.png
    │   ├── curso-cyber.png
    │   ├── curso-dev-web.png
    │   ├── curso-ia.png
    │   ├── curso-robotica.png
    │   └── curso-ux-ui.png
    │
    ├── dados/                    # Camada de dados (sem backend)
    │   ├── db.js                 # Abstração do localStorage (CRUD simulado)
    │   ├── dadosMock.js          # Dados iniciais: cursos, usuários, turmas, etc.
    │   ├── permissoes.js         # RBAC: perfis, seções visíveis, ações permitidas
    │   └── questoesQuiz.js       # Questões do quiz com gabarito e resolução
    │
    ├── componentes/              # Componentes reutilizáveis (UI compartilhado)
    │   ├── Botao.jsx             # Botão com Framer Motion e variantes
    │   ├── Modal.jsx             # Modal acessível com overlay
    │   ├── Toast.jsx             # Sistema de notificações temporárias
    │   ├── BarraProgresso.jsx    # Barra de progresso visual com ARIA
    │   ├── Insignia.jsx          # Badge de status com variantes de cor
    │   ├── CartaoEstatistica.jsx # Card de métrica (ícone + valor + rótulo)
    │   ├── TabelaDados.jsx       # Tabela acessível com caption e renderizadores
    │   ├── SelectSimples.jsx     # Dropdown customizado com teclado e ARIA
    │   ├── SelectUsuario.jsx     # Variação do select para seleção de usuário
    │   ├── ModalEdicaoUsuario.jsx# Modal de edição de dados de usuário
    │   ├── BarraLateral.jsx      # Sidebar de navegação com grupos accordion
    │   ├── BarraTopo.jsx         # Topbar fixa: breadcrumb, tema, perfil
    │   ├── NavGrupo.jsx          # Tabs horizontais por grupo de seções
    │   └── BarraNavMobile.jsx    # Barra de navegação inferior para mobile
    │
    ├── paginas/                  # Telas da aplicação organizadas por domínio
    │   ├── LayoutWorkspace.jsx   # Layout wrapper pós-autenticação
    │   ├── TelaLogin.jsx         # Fallback de login
    │   │
    │   ├── autenticacao/         # Telas públicas
    │   │   ├── TelaInicio.jsx        # Landing page com catálogo público
    │   │   ├── TelaLoginAluno.jsx    # Login de aluno
    │   │   ├── TelaLoginStaff.jsx    # Login de professor/coordenador/admin
    │   │   └── TelaCadastro.jsx      # Cadastro de novo aluno
    │   │
    │   ├── dashboard/            # Painéis por perfil
    │   │   ├── TelaDashboardAluno.jsx
    │   │   ├── TelaDashboardProfessor.jsx
    │   │   ├── TelaDashboardCoordenador.jsx
    │   │   └── TelaDashboardAdmin.jsx
    │   │
    │   ├── academico/            # Gestão acadêmica
    │   │   ├── TelaCursos.jsx        # CRUD de cursos
    │   │   ├── TelaModulos.jsx       # Módulos por curso
    │   │   ├── TelaTurmas.jsx        # Turmas e professores
    │   │   ├── TelaMatriculas.jsx    # Fluxo de matrículas
    │   │   ├── TelaAvaliacoes.jsx    # Avaliações e quizzes
    │   │   └── TelaConteudos.jsx     # Conteúdos por módulo
    │   │
    │   ├── aprendizado/          # Trilha do aluno
    │   │   ├── TelaQuiz.jsx          # Quiz interativo com timer
    │   │   ├── TelaProgresso.jsx     # Acompanhamento de progresso
    │   │   └── TelaCertificados.jsx  # Certificados desbloqueados
    │   │
    │   ├── usuarios/             # Gestão de usuários
    │   │   ├── TelaUsuarios.jsx      # Visão geral (uso interno)
    │   │   ├── TelaAlunos.jsx        # Lista e edição de alunos
    │   │   ├── TelaProfessores.jsx   # Lista e edição de professores
    │   │   └── TelaCoordenadores.jsx # Lista de coordenadores
    │   │
    │   └── admin/                # Exclusivo do administrador
    │       └── TelaCatalogo.jsx      # Controle de visibilidade do catálogo
    │
    └── estilos/                  # Todos os arquivos CSS
        ├── variaveis.css         # Design tokens globais (cores, tipografia, espaçamentos)
        ├── base.css              # Reset e estilos base
        ├── componentes.css       # Estilos dos componentes reutilizáveis
        ├── layout.css            # Layout do workspace, topbar, sidebar, responsividade
        └── paginas/              # Estilos específicos por página
            ├── publico.css
            ├── autenticacao.css
            ├── login.css
            ├── inicio.css
            ├── avaliacoes.css
            ├── usuarios.css
            ├── aprendizado.css
            └── workspace.css
```

---

## 7. Banco de Dados — localStorage

Como o projeto é um protótipo frontend sem backend, a persistência de dados é feita inteiramente no **localStorage do navegador**, com uma camada de abstração implementada em `src/dados/db.js`.

### Como funciona

**Seed automático:** na primeira abertura da aplicação, `inicializar()` verifica a chave `cdr_seed_v1`. Se não existir, carrega todos os dados mock no localStorage e marca o seed como concluído. Isso garante que os dados iniciais apareçam na primeira visita e que alterações feitas pelo usuário persistam nas visitas seguintes.

**Reset de demonstração:** o painel do administrador oferece um botão "Resetar Dados Demo" que chama `resetar()`, limpa o localStorage e força um novo seed — útil para demonstrações.

### Chaves do localStorage

| Chave | Conteúdo |
|-------|---------|
| `cdr_seed_v1` | Flag booleana — indica se o seed já foi executado |
| `cdr_cursos` | Array JSON com todos os cursos |
| `cdr_turmas` | Array JSON com todas as turmas |
| `cdr_modulos` | Array JSON com todos os módulos |
| `cdr_usuarios` | Array JSON com todos os usuários (todos os perfis) |
| `cdr_matriculas` | Array JSON com todas as matrículas |
| `coderyse-perfil` | String — chave do perfil autenticado (`aluno`, `professor`, `coordenador`, `admin`) |
| `coderyse-tema` | String — tema ativo (`claro` ou `escuro`) |
| `coderyse-sidebar` | String — estado da sidebar (`recolhida` ou `expandida`) |
| `coderyse-sidebar-grupos` | JSON — array de grupos expandidos na sidebar |
| `coderyse-visto-conteudos` | Boolean — controla badge de "novos conteúdos" |
| `coderyse-visto-avaliacoes` | Boolean — controla badge de "novas avaliações" |

### API do banco simulado

```javascript
// Leitura
db.cursos.listar()         // Retorna array de cursos do localStorage
db.turmas.listar()
db.modulos.listar()
db.usuarios.listar()
db.matriculas.listar()

// Persistência
db.cursos.salvar(lista)    // Serializa o array em JSON e salva no localStorage
db.turmas.salvar(lista)
db.modulos.salvar(lista)
db.usuarios.salvar(lista)
db.usuarios.salvarPorTipo(tipo, lista)  // Atualiza apenas usuários de um tipo
db.matriculas.salvar(lista)

// Utilitários
inicializar()              // Seed na primeira abertura
resetar()                  // Limpa tudo e força re-seed
```

### Estrutura de Entidades (modelo de dados)

#### Curso
```javascript
{
  id: number,
  codigoRegistro: "CRS-001",
  titulo: string,
  descricao: string,
  preco: number,
  totalModulos: number,
  totalAlunos: number,
  nivel: "Iniciante" | "Intermediário" | "Avançado",
  ativo: boolean,
  visivelCatalogo: boolean,   // controla exibição na home pública
  destaque: boolean,           // destaque na home
  coordenadorId: number | null
}
```

#### Módulo
```javascript
{
  id: number,
  cursoId: number,
  codigoRegistro: "MOD-001",
  titulo: string,
  ordem: number,
  totalConteudos: number
}
```

#### Turma
```javascript
{
  id: number,
  nome: "WEB-2024-A",
  cursoId: number,
  cursoTitulo: string,
  professorId: number | null,
  professorNome: string,
  totalAlunos: number,
  status: "Ativa" | "Concluída" | "Planejada"
}
```

#### Usuário
```javascript
{
  id: number,
  nome: string,
  email: string,
  tipo: "Aluno" | "Professor" | "Coordenador" | "Admin",
  telefone: string,
  cidade: string,
  estado: string,
  dataCadastro: "YYYY-MM-DD",
  ativo: boolean,
  // Campos exclusivos do Aluno:
  codigoAluno: "ALU-2024-001",
  cursosMatriculados: number[]
}
```

#### Matrícula
```javascript
{
  id: number,
  codigoRegistro: "MAT-2024-001",
  alunoId: number,
  alunoNome: string,
  cursoId: number,
  cursoTitulo: string,
  turmaId: number,
  turmaNome: string,
  status: "Aprovada" | "Pendente" | "Rejeitada",
  dataSolicitacao: "YYYY-MM-DD"
}
```

#### Avaliação
```javascript
{
  id: number,
  titulo: string,
  cursoId: number,
  moduloId: string,
  tentativasPermitidas: number,
  tempoLimite: number,      // em minutos
  totalQuestoes: number,
  status: "Publicada" | "Rascunho",
  novo: boolean             // controla badge na sidebar
}
```

#### Conteúdo
```javascript
{
  id: number,
  moduloId: string,
  titulo: string,
  tipo: "Video" | "Texto" | "Documento",
  duracao: string,           // ex: "18min"
  concluido: boolean,
  novo: boolean              // controla badge na sidebar
}
```

---

## 8. Controle de Acesso (RBAC)

O sistema implementa **Role-Based Access Control** com 4 perfis e controle de visibilidade e ações por seção.

### Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| **Admin** | Acesso total. Gerencia usuários, cursos, catálogo, matrículas e configurações. |
| **Coordenador** | Supervisão acadêmica. Visualiza e edita cursos, módulos, turmas, alunos e progresso. |
| **Professor** | Leciona turmas. Cria e edita módulos, avaliações e conteúdos. |
| **Aluno** | Aprende. Acessa conteúdos, faz avaliações, acompanha progresso e emite certificados. |

### Visibilidade de Seções por Perfil

| Seção | Admin | Coordenador | Professor | Aluno |
|-------|:-----:|:-----------:|:---------:|:-----:|
| Panorama (dashboard) | ✓ | ✓ | ✓ | ✓ |
| Alunos | ✓ | ✓ | ✓ | — |
| Professores | ✓ | ✓ | — | — |
| Coordenadores | ✓ | — | — | — |
| Cursos | ✓ | ✓ | — | — |
| Módulos | ✓ | ✓ | ✓ | — |
| Turmas | ✓ | ✓ | ✓ | — |
| Conteúdos | ✓ | — | ✓ | ✓ |
| Avaliações | — | — | ✓ | ✓ |
| Progresso | — | ✓ | ✓ | ✓ |
| Matrículas | ✓ | — | — | ✓ |
| Certificados | — | — | — | ✓ |
| Catálogo Público | ✓ | — | — | — |

### Permissões de Ação por Seção

| Seção | Criar | Editar | Excluir |
|-------|-------|--------|---------|
| Alunos | Admin, Coordenador | Admin, Coordenador | Admin |
| Professores | Admin, Coordenador | Admin, Coordenador | Admin |
| Coordenadores | Admin | Admin | Admin |
| Cursos | Admin | Admin, Coordenador | Admin |
| Módulos | Admin, Coordenador, Professor | Admin, Coordenador | Admin, Coordenador |
| Turmas | Admin, Coordenador | Admin, Coordenador | Admin |
| Matrículas | Admin | Admin | Admin |
| Avaliações | Professor | Professor | Professor |
| Conteúdos | Admin, Professor | Admin, Professor | Admin, Professor |
| Catálogo | — | Admin | Admin |

### Sidebar por Perfil (ordem de navegação)

**Aluno:** Minha Conta (Matrículas + Certificados) → Panorama → Aprendizado (Conteúdos + Avaliações + Progresso)

**Professor:** Panorama → Módulos → Turmas → Alunos → Conteúdos → Avaliações → Progresso

**Coordenador:** Panorama → Acadêmico (Cursos + Módulos + Turmas) → Usuários (Alunos + Professores) → Progresso

**Admin:** Panorama → Usuários (Alunos + Professores + Coordenadores) → Acadêmico (Cursos + Módulos + Turmas) → Matrículas → Conteúdos → Catálogo

---

## 9. Sistema de Rotas

Implementado com **React Router DOM v7**. O roteamento é client-side: o browser nunca recarrega entre navegações.

### Rotas Públicas (sem autenticação)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `TelaInicio` | Landing page com catálogo público de cursos |
| `/login` | `TelaLoginAluno` | Login de aluno |
| `/login-staff` | `TelaLoginStaff` | Login de professor, coordenador ou admin |
| `/cadastro` | `TelaCadastro` | Registro de novo aluno |

### Rotas Protegidas (requerem autenticação)

| Rota | Seção |
|------|-------|
| `/painel/dashboard` | Dashboard do perfil logado |
| `/painel/alunos` | Gestão de alunos |
| `/painel/professores` | Gestão de professores |
| `/painel/coordenadores` | Gestão de coordenadores |
| `/painel/cursos` | Catálogo acadêmico |
| `/painel/modulos` | Módulos por curso |
| `/painel/turmas` | Mapa de turmas |
| `/painel/matriculas` | Fluxo de matrículas |
| `/painel/avaliacoes` | Avaliações |
| `/painel/conteudos` | Conteúdos da trilha |
| `/painel/progresso` | Progresso acadêmico |
| `/painel/certificados` | Certificados do aluno |
| `/painel/catalogo` | Catálogo público (admin) |
| `/painel/quiz` | Quiz interativo |

O componente `LayoutWorkspace` usa `useParams` para capturar a seção da URL e renderizar dinamicamente o componente correto via `mapaTelas`. Rotas sem permissão exibem `TelaAcessoNegado`.

---

## 10. Componentes Reutilizáveis

Localizados em `src/componentes/`, estes componentes são usados em múltiplas páginas da aplicação.

### Botao
**Arquivo:** `Botao.jsx`  
Botão com animação de pressão via Framer Motion. Suporta variantes de estilo e tamanho.

```
Variantes: primario | secundario | fantasma | perigo
Tamanhos:  pequeno | medio | grande
```

### Modal
**Arquivo:** `Modal.jsx`  
Modal acessível com overlay escuro, título, botão de fechar e suporte a conteúdo arbitrário. Fecha ao pressionar ESC. Usa `role="dialog"` e `aria-modal="true"`.

### Toast
**Arquivo:** `Toast.jsx`  
Sistema de notificações temporárias (3,5 segundos). Tipos: `sucesso`, `erro`, `aviso`, `info`. Live region ARIA para leitores de tela. Máximo de 3 toasts simultâneos.

### Insignia
**Arquivo:** `Insignia.jsx`  
Badge de status com mapeamento automático de texto para variante de cor:
- "Aprovada" → verde
- "Pendente" → amarelo
- "Rejeitada" → vermelho
- "Ativa" → azul
- "Concluída" → verde
- "Rascunho" → cinza

### CartaoEstatistica
**Arquivo:** `CartaoEstatistica.jsx`  
Card de métrica com ícone, valor numérico e rótulo descritivo. Borda colorida configurável. Usado nos dashboards de todos os perfis.

### TabelaDados
**Arquivo:** `TabelaDados.jsx`  
Tabela acessível com `<caption>`, cabeçalhos com `scope`, renderizadores customizados por coluna (permite células com badges, botões, etc.) e mensagem de estado vazio.

### SelectSimples / SelectUsuario
**Arquivos:** `SelectSimples.jsx`, `SelectUsuario.jsx`  
Dropdowns totalmente customizados (sem o `<select>` nativo), com:
- Navegação por teclado (↑ ↓ Enter Escape)
- Atributos ARIA completos (`role="listbox"`, `aria-selected`, `aria-expanded`)
- Posicionamento absoluto sem afetar o layout
- Estado de erro com mensagem visual

### BarraLateral
**Arquivo:** `BarraLateral.jsx`  
Sidebar de navegação fixa com:
- **Grupos accordion** expansíveis (Usuários, Acadêmico, Aprendizado, Minha Conta)
- Modo recolhido (64px) com hover peek (272px)
- Badges de notificação (matrículas pendentes, novos conteúdos, novas avaliações)
- Persistência do estado de recolhimento e grupos expandidos no localStorage
- Overlay mobile com fechamento ao clicar fora

### BarraTopo
**Arquivo:** `BarraTopo.jsx`  
Topbar fixa no topo com:
- Breadcrumb: `CodeRyse Academy › Nome da Seção`
- Switch de tema claro/escuro (persistido no localStorage)
- Popup de perfil com dados do usuário, badge de tipo e botão de logout
- Avatar colorido por perfil (roxo=Aluno, azul=Professor, amarelo=Coordenador, vermelho=Admin)
- NavGrupo integrado (tabs de sub-navegação quando há grupo ativo)
- Atalho de certificados (ícone troféu) para alunos

### NavGrupo
**Arquivo:** `NavGrupo.jsx`  
Barra de tabs horizontais que aparece dentro da topbar quando a seção atual pertence a um grupo com 2 ou mais filhos visíveis. Permite navegar entre seções do mesmo grupo sem usar a sidebar.

### BarraNavMobile
**Arquivo:** `BarraNavMobile.jsx`  
Barra de navegação fixa na parte inferior da tela, visível apenas em telas ≤ 768px. Exibe no máximo 5 itens adaptados ao perfil do usuário, com ícones e rótulos curtos.

---

## 11. Páginas e Telas

### Telas Públicas

**TelaInicio** — Landing page com hero banner, catálogo de cursos visíveis (`visivelCatalogo: true`), pilares da plataforma (Qualidade, Tecnologia, Suporte) e chamadas para login e cadastro.

**TelaLoginAluno / TelaLoginStaff** — Formulários de autenticação com seleção visual de perfil. Ao fazer login, o perfil é salvo no localStorage e o usuário é redirecionado para `/painel`.

**TelaCadastro** — Formulário de registro com validação de campos.

### Dashboards (por perfil)

**TelaDashboardAluno** — Cursos em andamento com barra de progresso, próximos conteúdos, módulos concluídos e matrículas ativas.

**TelaDashboardProfessor** — Cards com total de turmas, alunos, avaliações publicadas e média de notas. Lista de turmas lecionadas.

**TelaDashboardCoordenador** — KPIs de cursos, turmas, alunos e matrículas pendentes. Visão de cursos sob coordenação.

**TelaDashboardAdmin** — 4 cards de KPI globais (usuários, cursos ativos, turmas, taxa de conclusão), matrículas pendentes e botão de reset de dados.

### Telas Acadêmicas

**TelaCursos** — Tabela de cursos com colunas de código, título, nível, módulos, alunos e status. Menu de opções (`...`) por curso com modal de detalhes inline. Criação e edição via modal.

**TelaModulos** — Módulos agrupados por curso (accordion). Cada módulo tem menu `...` com modal de detalhes (alunos, conteúdos, avaliações, desempenho médio).

**TelaTurmas** — Lista de turmas com professor responsável, total de alunos e status. Atribuição de professor via dropdown customizado.

**TelaMatriculas** — Tabela de solicitações com filtro por status. Admin pode aprovar ou rejeitar em massa.

**TelaAvaliacoes** — Lista de avaliações com tipo, módulo, tentativas e tempo. Professor pode criar e publicar avaliações.

**TelaConteudos** — Conteúdos da trilha agrupados por módulo. Tipo de conteúdo (vídeo, texto, documento), duração e status de conclusão.

### Telas de Aprendizado

**TelaQuiz** — Interface de quiz com timer regressivo, questões de múltipla escolha com análise teórica (material UNIP/ADS), cálculo automático de aprovação (≥ 70%) e resultado final com porcentagem.

**TelaProgresso** — Gráfico de progresso por módulo (Recharts) e linha do tempo de conclusão de cursos.

**TelaCertificados** — Hero banner com contadores de certificados desbloqueados e bloqueados. Cards de certificado com nota, data de conclusão e indicação de status.

### Telas de Usuários

Três telas com estrutura similar: lista de usuários em tabela com filtros de busca, edição via modal (`ModalEdicaoUsuario`), alternância de status ativo/inativo e criação de novos registros.

### TelaCatalogo (Admin)

Painel de controle de visibilidade: toggle por curso para `visivelCatalogo` e `destaque`. Alterações refletem imediatamente na landing page pública.

---

## 12. Sistema de Estilos

### Filosofia

Todo o estilo é escrito em **CSS puro**, sem pré-processadores, frameworks de utilitários ou CSS-in-JS. A organização segue a metodologia **BEM** (Block\_\_Element--Modifier) para nomenclatura de classes.

Exemplo de nomenclatura BEM:
```
.sidebar__item--ativo
.topbar__breadcrumb-secao
.botao--primario
.nav-grupo__tab--ativo
```

### Design Tokens (variaveis.css)

Todas as decisões visuais são centralizadas como variáveis CSS:

```css
/* Tipografia */
--fonte-principal: Inter, system-ui, sans-serif;
--texto-xs: 0.75rem;   /* 12px */
--texto-sm: 0.8125rem; /* 13px */
--texto-md: 0.875rem;  /* 14px */
--texto-lg: 1rem;      /* 16px */

/* Cor da marca */
--cor-primaria:        #7b2ff7;  /* roxo */
--cor-primaria-fundo:  rgba(123, 47, 247, 0.12);

/* Cores semânticas */
--cor-sucesso:         #22c55e;
--cor-aviso:           #f59e0b;
--cor-erro:            #ef4444;
--cor-info:            #3b82f6;

/* Layout */
--altura-topbar:       64px;
--largura-sidebar:     272px;  /* dinâmica via JS */

/* Espaçamentos */
--espaco-xs: 0.25rem;
--espaco-sm: 0.5rem;
--espaco-md: 1rem;
--espaco-lg: 1.5rem;
--espaco-xl: 2rem;
--espaco-2xl: 3rem;

/* Transições */
--transicao-rapida:  120ms ease;
--transicao-normal:  200ms ease;
--transicao-lenta:   320ms ease;
```

### Tema Claro / Escuro

O tema é controlado pelo atributo `data-tema` no elemento `<html>`:
- `<html data-tema="escuro">` — padrão (fundo escuro, texto claro)
- `<html data-tema="claro">` — versão light

O CSS usa seletores como `[data-tema="claro"] .topbar { ... }` para sobrescrever as variáveis de cor. O estado é persistido em `localStorage` (chave `coderyse-tema`) e ativado pelo switch na topbar.

### Arquivos CSS e Responsabilidades

| Arquivo | Responsabilidade |
|---------|-----------------|
| `variaveis.css` | Design tokens: cores, tipografia, espaçamentos, sombras, bordas, transições |
| `base.css` | Reset, normalização, estilos base de elementos HTML (body, h1-h6, links, inputs) |
| `componentes.css` | Estilos de todos os componentes reutilizáveis: botões, modais, toasts, tabelas, badges, selects, campos |
| `layout.css` | Estrutura do workspace: sidebar, topbar, área de conteúdo, NavGrupo, BarraNavMobile, media queries |
| `paginas/workspace.css` | Estilos das telas internas: cabeçalhos, grids, cards de dashboard, seções acadêmicas |
| `paginas/autenticacao.css` | Formulários de login e cadastro |
| `paginas/inicio.css` | Landing page: hero, grid de cursos, pilares |
| `paginas/aprendizado.css` | Quiz, progresso, certificados |
| `paginas/avaliacoes.css` | Tela de avaliações |
| `paginas/usuarios.css` | Telas de gestão de usuários |

---

## 13. Responsividade

A responsividade é implementada exclusivamente com **CSS puro** — sem frameworks. A estratégia combina layouts fluidos (Flexbox e CSS Grid) com media queries e variáveis CSS dinâmicas.

### Breakpoints

| Breakpoint | Largura | Comportamento |
|-----------|---------|---------------|
| **Desktop** | > 768px | Layout completo com sidebar visível, topbar fixa, conteúdo ao lado da sidebar |
| **Tablet / Mobile** | ≤ 768px | Sidebar oculta (slideIn), topbar de ponta a ponta, BarraNavMobile visível, grids simplificados |
| **Mobile pequeno** | ≤ 480px | Grade de estatísticas em coluna única, modais em tela cheia, tipografia reduzida |

### Técnicas Utilizadas

**1. Sidebar colapsável (desktop)**
A sidebar pode ser recolhida para 64px pelo usuário, exibindo apenas ícones. Em hover, ela abre temporariamente em 272px (modo "peek"). O estado é controlado via CSS class e variável `--largura-sidebar` atualizada por JavaScript.

```css
/* A variável é ajustada pelo JavaScript ao recolher/expandir */
.layout-conteudo {
  margin-left: var(--largura-sidebar);
  transition: margin-left var(--transicao-normal);
}
```

**2. Sidebar como drawer mobile (≤ 768px)**
Em mobile, a sidebar se transforma em um drawer que entra pela esquerda com `transform: translateX(-100%)`. Um overlay escuro aparece sobre o conteúdo.

```css
@media (max-width: 768px) {
  :root { --largura-sidebar: 0px; }

  .sidebar {
    transform: translateX(-100%);
    z-index: 300;
  }

  .sidebar--aberta {
    transform: translateX(0);
  }

  .layout-conteudo { margin-left: 0; }
  .topbar { left: 0; }
}
```

**3. BarraNavMobile (mobile)**
Em mobile, a navegação principal é substituída pela `BarraNavMobile` — uma barra fixa na parte inferior da tela, inspirada em apps móveis nativos. Visível apenas com CSS:

```css
.nav-mobile { display: none; }

@media (max-width: 768px) {
  .nav-mobile { display: flex; }
}
```

**4. Grids fluidos**
Os grids se adaptam automaticamente:
- `.grade-2` e `.grade-3`: 2 ou 3 colunas no desktop → 1 coluna no mobile
- `.grade-estatisticas`: 4 colunas → 2 colunas (≤ 768px) → 1 coluna (≤ 480px)
- `.grade-cursos`: multi-coluna → 1 coluna no mobile

**5. Topbar com tabs (NavGrupo)**
Quando a seção ativa pertence a um grupo, a topbar expande verticalmente para acomodar a barra de tabs. O `main` compensa com padding adicional:

```css
.layout-principal--com-tabs {
  padding-top: calc(var(--altura-topbar) + 44px + var(--espaco-xl));
}
```

**6. Modais responsivos**
Em mobile, modais ocupam a largura total da tela com padding reduzido e bordas removidas para aproveitar o espaço.

**7. Tipografia fluida**
Tamanhos de fonte são reduzidos em telas menores via media queries, e o uso consistente de `em` e `rem` garante escalonamento proporcional.

---

## 14. Dados Mock

Os dados de demonstração estão em `src/dados/dadosMock.js` e cobrem todas as entidades do sistema.

### Resumo dos dados incluídos

| Entidade | Quantidade |
|----------|-----------|
| Perfis de login demo | 4 (Aluno, Professor, Coordenador, Admin) |
| Cursos | 6 |
| Módulos | 15 (distribuídos entre os 6 cursos) |
| Turmas | 6 |
| Usuários | 21 (14 alunos, 4 professores, 2 coordenadores, 1 admin) |
| Matrículas | 8 |
| Avaliações | 8 |
| Conteúdos | 10 (trilha do curso de Desenvolvimento Web) |
| Questões de quiz | 15+ (material UNIP — Análise e Desenvolvimento de Sistemas) |
| Certificados demo | 1 (UX e UI Design, concluído com nota 9.2) |

### Cursos disponíveis

| Código | Título | Nível | Alunos | Preço |
|--------|--------|-------|--------|-------|
| CRS-001 | Desenvolvimento Web | Iniciante | 142 | R$ 1.299,90 |
| CRS-002 | Ciência de Dados | Intermediário | 98 | R$ 1.499,90 |
| CRS-003 | Inteligência Artificial | Avançado | 54 | R$ 1.890,00 |
| CRS-004 | Cybersegurança | Avançado | 67 | R$ 1.750,00 |
| CRS-005 | UX e UI Design | Iniciante | 115 | R$ 999,90 |
| CRS-006 | Robótica | Intermediário | 38 | R$ 1.590,00 |

### Perfis de demonstração (login)

| Perfil | Nome demo | E-mail |
|--------|-----------|--------|
| Aluno | Maria Isabela Branco | maria.isabela@coderyse.com |
| Professor | Heitor Henrique Nadir | heitor.nadir@coderyse.com |
| Coordenador | Nicolas Pimentel | nicolas.pimentel@coderyse.com |
| Admin | Krigor de Sousa | krigor@coderyse.com |

---

## 15. Fluxo de Autenticação

A autenticação é simulada no frontend sem JWT, OAuth ou sessão real.

```
1. Usuário acessa "/" (TelaInicio)
      ↓
2. Clica em "Entrar" → "/login" ou "/login-staff"
      ↓
3. Seleciona o perfil demo e clica em entrar
      ↓
4. fazerLogin(chave) → salva chave no localStorage ("coderyse-perfil")
      ↓
5. Aplicacao.jsx detecta usuarioLogado → redireciona para "/painel"
      ↓
6. LayoutWorkspace carrega → resolve dashboard por perfil
      ↓
7. Sidebar e topbar adaptam ao perfil do usuário
      ↓
8. Logout → fazerLogout() → remove localStorage → volta para "/"
```

### Rota Protegida

O componente `RotaProtegida` envolve todas as rotas `/painel/*`. Se `usuarioLogado` for `null`, redireciona para `/`.

---

## 16. Acessibilidade

A aplicação foi construída com atenção às diretrizes **WCAG 2.1** e ao uso semântico do HTML5.

### Práticas implementadas

- **Elementos semânticos:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`, `<article>` no lugar de `<div>` genéricos onde aplicável
- **ARIA attributes:** `role`, `aria-label`, `aria-expanded`, `aria-selected`, `aria-current`, `aria-modal`, `aria-haspopup`, `aria-hidden`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` em todos os componentes interativos
- **Navegação por teclado:** modais fecham com ESC, dropdowns navegam com ↑ ↓ Enter Escape, foco gerenciado corretamente
- **Live regions:** toasts usam `role="status"` e `aria-live="polite"` para anunciar notificações a leitores de tela
- **Skip link:** link oculto "Ir para o conteúdo" no início da página para usuários de teclado
- **Tabelas acessíveis:** `<caption>` descritivo, `scope="col"` nos cabeçalhos
- **Formulários:** `<label>` associado a cada campo, mensagens de erro vinculadas por `aria-describedby`
- **Contraste:** paleta de cores atende ao mínimo de 4.5:1 para texto normal (WCAG AA)
- **Ícones decorativos:** todos com `aria-hidden="true"` para não poluir a leitura por voz

---

## 17. Fluxo do Sistema

### 17.1 Entrada na Plataforma

```
Usuário acessa "/"
        ↓
  TelaInicio (pública)
  ├── Vê catálogo de cursos visíveis (visivelCatalogo: true)
  ├── Vê pilares da plataforma
  └── Escolhe uma ação:
        ├── "Entrar como Aluno"    → /login
        ├── "Entrar como Staff"    → /login-staff
        └── "Cadastrar-se"         → /cadastro
```

### 17.2 Autenticação

```
/login  (Aluno)                    /login-staff  (Professor / Coordenador / Admin)
        ↓                                   ↓
  Seleciona perfil demo           Seleciona perfil demo
        ↓                                   ↓
  fazerLogin(chave)  →  salva "coderyse-perfil" no localStorage
        ↓
  Redireciona para /painel
```

### 17.3 Layout Pós-Login

```
/painel  →  LayoutWorkspace carrega
        ↓
  ┌─────────────────────────────────────────┐
  │  BarraLateral   │   BarraTopo           │
  │  (sidebar)      │   (topbar fixa)       │
  │                 │   └── NavGrupo (tabs) │
  │  navegação      ├───────────────────────│
  │  por seção      │   <ComponenteTela />  │
  │                 │   (tela ativa)        │
  └─────────────────┴───────────────────────┘
         BarraNavMobile (apenas mobile ≤768px)
```

### 17.4 Fluxo por Perfil

#### ALUNO

```
Dashboard
├── Vê cursos em andamento + progresso
├── Vê próximos conteúdos da trilha
└── Vê matrículas ativas

Minha Conta
├── Matrículas
│   └── Consulta status (Aprovada / Pendente / Rejeitada)
└── Certificados
    └── Vê cursos concluídos + nota + data
        └── Cursos não concluídos aparecem bloqueados

Aprendizado
├── Conteúdos
│   ├── Navega por módulos e conteúdos (vídeo, texto, documento)
│   └── Marca conteúdo como concluído → ativa botão "Fazer Avaliação"
├── Avaliações
│   ├── Vê avaliações disponíveis por módulo
│   └── Inicia Quiz → TelaQuiz
│       ├── Timer regressivo
│       ├── Responde questões de múltipla escolha
│       ├── Correção automática
│       └── ≥ 70% → Aprovado → desbloqueia próximo módulo
└── Progresso
    ├── Gráfico de conclusão por módulo
    └── Linha do tempo do curso
```

#### PROFESSOR

```
Dashboard
├── KPIs: turmas, alunos, avaliações, média de notas
└── Lista de turmas lecionadas

Módulos
├── Vê módulos dos cursos das suas turmas
└── Abre modal de detalhes (alunos, conteúdos, desempenho)

Turmas → Consulta turmas e total de alunos

Alunos → Consulta lista de alunos das suas turmas

Conteúdos
├── Cria e edita conteúdos por módulo
└── Define tipo (vídeo, texto, documento) e duração

Avaliações
├── Cria avaliações com título, módulo, tentativas e tempo
├── Publica ou mantém como rascunho
└── Edita e exclui avaliações existentes

Progresso → Acompanha desempenho dos alunos por módulo
```

#### COORDENADOR

```
Dashboard
├── KPIs: cursos, turmas, alunos, matrículas pendentes
└── Visão dos cursos sob coordenação

Acadêmico
├── Cursos    → Visualiza e edita catálogo acadêmico
├── Módulos   → Cria e edita estrutura de módulos
└── Turmas    → Atribui professor e acompanha status

Usuários
├── Alunos      → Lista, edita dados, ativa/desativa
└── Professores → Lista, edita, ativa/desativa

Progresso → Dashboard de progresso global por curso e módulo
```

#### ADMIN

```
Dashboard
├── 4 KPIs globais: usuários, cursos ativos, turmas, taxa de conclusão
├── Matrículas pendentes em destaque
└── Botão "Resetar Dados Demo" → limpa localStorage e refaz o seed

Usuários
├── Alunos        → CRUD completo
├── Professores   → CRUD completo
└── Coordenadores → lista e edição

Acadêmico
├── Cursos   → CRUD completo (criação, edição, exclusão)
├── Módulos  → CRUD completo
└── Turmas   → CRUD completo + atribuição de professor

Matrículas
├── Lista todas as solicitações com filtro por status
└── Aprova ou rejeita em massa

Conteúdos → Gerencia conteúdos de todos os módulos

Catálogo Público
├── Ativa/desativa visibilidade de cursos na home
└── Marca cursos como "Destaque"
    └── Reflete imediatamente na TelaInicio (pública)
```

### 17.5 Controle de Acesso

```
Usuário navega para uma seção
        ↓
LayoutWorkspace verifica temPermissao(usuario.tipo, secao)
        ↓
  SIM → renderiza <ComponenteTela />
  NÃO → renderiza <TelaAcessoNegado />
```

### 17.6 Persistência de Dados

```
Qualquer alteração (CRUD)
        ↓
  Componente atualiza estado local
        ↓
  useEffect dispara db.<entidade>.salvar(lista)
        ↓
  localStorage atualizado
        ↓
  Dados persistem entre reloads
```

### 17.7 Logout

```
Usuário clica "Sair da conta" na topbar
        ↓
  Modal de confirmação
        ↓
  Confirma → fazerLogout()
        ↓
  Remove "coderyse-perfil" do localStorage
        ↓
  Redireciona para "/"
```

---

*Documentação gerada em maio de 2026 — CodeRyse Academy v1.0.0*
