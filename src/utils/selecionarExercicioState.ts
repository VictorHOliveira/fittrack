let _selecionados: string[] = [];
let _listeners: (() => void)[] = [];

export function confirmarSelecao(ids: string[]) {
  _selecionados = ids;
  _listeners.forEach((fn) => fn());
}

export function pegarSelecionados(): string[] {
  const valor = _selecionados;
  _selecionados = [];
  return valor;
}

export function onSelecionado(callback: () => void) {
  _listeners.push(callback);
  return () => {
    _listeners = _listeners.filter((fn) => fn !== callback);
  };
}
