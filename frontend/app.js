document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/reservas';
  const reservasList = document.getElementById('reservasList');
  const reservaForm = document.getElementById('reservaForm');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const btnCancelar = document.getElementById('btnCancelar');
  
  let editingId = null;

  // Carrega todas as reservas
  async function loadReservas() {
    try {
      const response = await fetch(API_URL);
      const reservas = await response.json();
      displayReservas(reservas);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
  }

  // Exibe as reservas na lista
  function displayReservas(reservas) {
    reservasList.innerHTML = '';
    
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    
    const filtered = reservas.filter(reserva => {
      const matchesSearch = reserva.nomeHospede.toLowerCase().includes(searchTerm);
      const matchesStatus = statusValue === 'all' || reserva.status === statusValue;
      return matchesSearch && matchesStatus;
    });
    
    if (filtered.length === 0) {
      reservasList.innerHTML = '<p class="no-results">Nenhuma reserva encontrada</p>';
      return;
    }
    
    filtered.forEach(reserva => {
      const reservaCard = document.createElement('div');
      reservaCard.className = 'reserva-card';
      
      reservaCard.innerHTML = `
        <div class="reserva-header">
          <span class="reserva-title">${reserva.nomeHospede}</span>
          <span class="reserva-status status-${reserva.status}">${reserva.status}</span>
        </div>
        <div class="reserva-details">
          <div>
            <strong>Quarto:</strong>
            <span>${reserva.quarto} (${reserva.tipoQuarto})</span>
          </div>
          <div>
            <strong>Período:</strong>
            <span>${formatDate(reserva.dataEntrada)} a ${formatDate(reserva.dataSaida)}</span>
          </div>
          <div>
            <strong>E-mail:</strong>
            <span>${reserva.email}</span>
          </div>
        </div>
        <div class="reserva-actions">
          <button class="action-btn edit-btn" data-id="${reserva.id}">Editar</button>
          <button class="action-btn delete-btn" data-id="${reserva.id}">Cancelar</button>
        </div>
      `;
      
      reservasList.appendChild(reservaCard);
    });
    
    // Adiciona eventos aos botões
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => editReserva(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => deleteReserva(e.target.dataset.id));
    });
  }

  // Formata data para exibição
  function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  }

  // Envia o formulário (cria ou atualiza)
  reservaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reservaData = {
      nomeHospede: document.getElementById('nomeHospede').value,
      email: document.getElementById('email').value,
      quarto: document.getElementById('quarto').value,
      tipoQuarto: document.getElementById('tipoQuarto').value,
      dataEntrada: document.getElementById('dataEntrada').value,
      dataSaida: document.getElementById('dataSaida').value,
      status: 'confirmada'
    };
    
    try {
      let response;
      
      if (editingId) {
        // Atualiza reserva existente
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservaData)
        });
      } else {
        // Cria nova reserva
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservaData)
        });
      }
      
      if (response.ok) {
        resetForm();
        loadReservas();
      }
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
    }
  });

  // Edita uma reserva
  async function editReserva(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const reserva = await response.json();
      
      document.getElementById('nomeHospede').value = reserva.nomeHospede;
      document.getElementById('email').value = reserva.email;
      document.getElementById('quarto').value = reserva.quarto;
      document.getElementById('tipoQuarto').value = reserva.tipoQuarto;
      document.getElementById('dataEntrada').value = reserva.dataEntrada;
      document.getElementById('dataSaida').value = reserva.dataSaida;
      
      editingId = id;
      document.getElementById('btnSalvar').textContent = 'Atualizar Reserva';
    } catch (error) {
      console.error('Erro ao carregar reserva para edição:', error);
    }
  }

  // Cancela/Deleta uma reserva
  async function deleteReserva(id) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadReservas();
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
    }
  }

  // Reseta o formulário
  function resetForm() {
    reservaForm.reset();
    editingId = null;
    document.getElementById('btnSalvar').textContent = 'Salvar Reserva';
  }

  // Evento do botão cancelar
  btnCancelar.addEventListener('click', resetForm);

  // Filtros
  searchInput.addEventListener('input', loadReservas);
  statusFilter.addEventListener('change', loadReservas);

  // Carrega as reservas ao iniciar
  loadReservas();
});