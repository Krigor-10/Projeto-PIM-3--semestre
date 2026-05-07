# 🎓 CodeRyse Academy — Protótipo Frontend PIM 3

Protótipo de interface desenvolvido como Projeto Integrado Multidisciplinar (PIM 3) da UNIP.  
Simula o painel acadêmico de uma plataforma de ensino digital com controle de acesso por perfil.

---

## 🛠️ Tecnologias

- ⚛️ **React 19** + ⚡ **Vite 8**
- 🎨 CSS puro com variáveis customizadas (tema escuro)
- 📦 Sem bibliotecas de UI externas
- 🗃️ Dados simulados (mock) — sem backend

---

## 👥 Perfis de acesso

| Perfil | Acesso |
|---|---|
| 🔴 **Admin** | Controle total da plataforma |
| 🟠 **Coordenador** | Gestão de cursos, turmas, alunos e professores |
| 🟡 **Professor** | Lança avaliações e conteúdos; visualiza alunos e turmas |
| 🟢 **Aluno** | Acompanha matrículas, conteúdos, avaliações e progresso |

---

## 🗂️ Seções da plataforma

- 📊 Panorama (dashboard por perfil)
- 👤 Usuários · Alunos · Professores · Coordenadores
- 📚 Cursos · Módulos · Turmas
- 📝 Matrículas · Avaliações · Quiz · Conteúdos · Progresso

---

## 🚀 Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

Acesse `http://localhost:5173` após iniciar o servidor.

---

## 📁 Estrutura do projeto

```
src/
├── ativos/          # 🖼️ Imagens dos cursos e banner
├── componentes/     # 🧩 Componentes reutilizáveis (Modal, Tabela, Insignia...)
├── dados/           # 🗃️ Dados mock e sistema de permissões (RBAC)
├── estilos/         # 🎨 CSS global e estilos de páginas
└── paginas/         # 📄 Telas da aplicação
```

---

## 📖 Cursos disponíveis

1. 🌐 Desenvolvimento Web
2. 📊 Ciência de Dados
3. 🤖 Inteligência Artificial
4. 🔐 Cybersegurança
5. 🎨 UX e UI Design
6. 🦾 Robótica

---

## 👨‍💻 Desenvolvido por

**Krigor Nasare** — Análise e Desenvolvimento de Sistemas, UNIP  
PIM 3 — 3º Semestre · 2024
