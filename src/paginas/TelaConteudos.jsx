import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import Modal from "../componentes/Modal.jsx";
import { conteudos, modulos } from "../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../dados/permissoes.js";

const iconesPorTipo = {
  Video: "VD",
  Texto: "TX",
  Documento: "DC",
};

export default function TelaConteudos({ usuario }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroModulo, setFiltroModulo] = useState("");

  const tipo = usuario?.tipo;

  const conteudosFiltrados = filtroModulo
    ? conteudos.filter((c) => c.moduloId === Number(filtroModulo))
    : conteudos;

  return (
    <div className="tela-conteudos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Conteudos Didaticos</h2>
          <p className="cabecalho-pagina__subtitulo">{conteudos.length} conteudos cadastrados</p>
        </div>
        {podeCriar(tipo, "conteudos") && (
          <button className="botao botao--primario" onClick={() => setModalAberto(true)} type="button">
            + Novo Conteúdo
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="filtro-modulo-cont" className="visualmente-oculto">Filtrar por modulo</label>
        <select
          id="filtro-modulo-cont"
          className="campo__entrada barra-filtros__select"
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
        >
          <option value="">Todos os modulos</option>
          {modulos.map((m) => (
            <option key={m.id} value={m.id}>{m.titulo}</option>
          ))}
        </select>
      </div>

      <ul className="lista-conteudos-completa" role="list" aria-label="Lista de conteudos didaticos">
        {conteudosFiltrados.map((cont) => {
          const modulo = modulos.find((m) => m.id === cont.moduloId);
          return (
            <li key={cont.id} className="cartao-conteudo">
              <div className="cartao-conteudo__icone" aria-hidden="true">
                {iconesPorTipo[cont.tipo] || "AR"}
              </div>
              <div className="cartao-conteudo__info">
                <h3 className="cartao-conteudo__titulo">{cont.titulo}</h3>
                <p className="cartao-conteudo__modulo">
                  {modulo?.titulo ?? "Modulo desconhecido"}
                </p>
              </div>
              <div className="cartao-conteudo__meta">
                <span className="cartao-conteudo__duracao">DUR {cont.duracao}</span>
                <Insignia texto={cont.tipo} variante="marca" />
                <Insignia
                  texto={cont.concluido ? "Concluido" : "Pendente"}
                  variante={cont.concluido ? "sucesso" : "neutro"}
                />
              </div>
              {podeEditar(tipo, "conteudos") && (
                <div className="cartao-conteudo__acoes">
                  <button className="botao botao--fantasma botao--pequeno" type="button" aria-label={`Editar conteúdo ${cont.titulo}`}>
                    Editar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {conteudosFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum conteudo encontrado.
        </p>
      )}

      {modalAberto && (
        <Modal titulo="Novo Conteudo Didatico" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-cont">Titulo *</label>
              <input id="titulo-cont" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="modulo-cont">Modulo *</label>
              <select id="modulo-cont" className="campo__entrada" required>
                <option value="">Selecione um modulo</option>
                {modulos.map((m) => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="tipo-cont">Tipo *</label>
              <select id="tipo-cont" className="campo__entrada" required>
                <option value="">Selecione o tipo</option>
                <option value="Video">Video</option>
                <option value="Texto">Texto</option>
                <option value="Documento">Documento</option>
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="duracao-cont">Duracao</label>
              <input id="duracao-cont" className="campo__entrada" type="text" placeholder="Ex: 20min" />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Criar Conteudo</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
