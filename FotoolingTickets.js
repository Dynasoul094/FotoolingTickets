document.addEventListener('DOMContentLoaded', function() {
  const nameDropdown = document.querySelector('#name').parentElement;
  const kanaalDropdown = document.querySelector('#kanaal').parentElement;
  const editNameDropdown = document.querySelector('#editTicketName').parentElement;
  const editKanaalDropdown = document.querySelector('#editTicketKanaal').parentElement;

  const names = ["Ahmad Paknehad", "Stefan Bakker", "Edwin Brink"];
  const kanalen = ["Mail", "Telefoon", "Jira"];

  function toggleDropdown(dropdown) {
      dropdown.querySelector('.dropdown-list').classList.toggle('show');
  }

  function closeDropdown(dropdown) {
      dropdown.querySelector('.dropdown-list').classList.remove('show');
  }

  function handleOptionClick(input, option) {
      input.value = option.textContent;
      closeDropdown(input.parentElement);
  }

  function populateDropdown(dropdown, options) {
      const dropdownList = dropdown.querySelector('.dropdown-list');
      dropdownList.innerHTML = ''; // Clear previous options
      options.forEach(optionText => {
          const optionElement = document.createElement('li');
          optionElement.textContent = optionText;
          optionElement.addEventListener('click', () => handleOptionClick(dropdown.querySelector('input'), optionElement));
          dropdownList.appendChild(optionElement);
      });
  }

  function populateKanaalDropdown(selectedValue) {
      const dropdownList = document.getElementById('editKanaalDropdownList');
      dropdownList.innerHTML = ''; // Clear previous options

      kanalen.forEach(optionText => {
          const optionElement = document.createElement('li');
          optionElement.textContent = optionText;
          optionElement.addEventListener('click', () => {
              document.getElementById('editTicketKanaal').value = optionElement.textContent;
              closeDropdown(editKanaalDropdown);
          });
          if (optionText === selectedValue) {
              document.getElementById('editTicketKanaal').value = optionText;
          }
          dropdownList.appendChild(optionElement);
      });
  }

  function populateNameDropdown(selectedValue) {
      const dropdownList = document.getElementById('editNameDropdownList');
      dropdownList.innerHTML = ''; // Clear previous options

      names.forEach(optionText => {
          const optionElement = document.createElement('li');
          optionElement.textContent = optionText;
          optionElement.addEventListener('click', () => {
              document.getElementById('editTicketName').value = optionElement.textContent;
              closeDropdown(editNameDropdown);
          });
          if (optionText === selectedValue) {
              document.getElementById('editTicketName').value = optionText;
          }
          dropdownList.appendChild(optionElement);
      });
  }

  nameDropdown.querySelector('input').addEventListener('click', () => toggleDropdown(nameDropdown));
  populateDropdown(nameDropdown, names);

  kanaalDropdown.querySelector('input').addEventListener('click', () => toggleDropdown(kanaalDropdown));
  populateDropdown(kanaalDropdown, kanalen);

  editNameDropdown.querySelector('input').addEventListener('click', () => toggleDropdown(editNameDropdown));
  populateDropdown(editNameDropdown, names);

  editKanaalDropdown.querySelector('input').addEventListener('click', () => toggleDropdown(editKanaalDropdown));
  populateKanaalDropdown("");

  document.addEventListener('click', (event) => {
      const isClickInsideNameDropdown = nameDropdown.contains(event.target);
      const isClickInsideKanaalDropdown = kanaalDropdown.contains(event.target);
      const isClickInsideEditNameDropdown = editNameDropdown.contains(event.target);
      const isClickInsideEditKanaalDropdown = editKanaalDropdown.contains(event.target);

      if (!isClickInsideNameDropdown) {
          closeDropdown(nameDropdown);
      }

      if (!isClickInsideKanaalDropdown) {
          closeDropdown(kanaalDropdown);
      }
      
      if (!isClickInsideEditNameDropdown) {
          closeDropdown(editNameDropdown);
      }

      if (!isClickInsideEditKanaalDropdown) {
          closeDropdown(editKanaalDropdown);
      }
  });

  document.getElementById('resetButton').addEventListener('click', () => {
      document.getElementById('ticketForm').reset();
      document.querySelector('.dropdown-list').classList.remove('show');
  });

  let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  let editingIndex = null;

  function addTicketToList(name, issue, kanaal, completed) {
      const ticketItem = document.createElement('li');
      ticketItem.innerHTML = `
          <div class="ticket-content">
              <strong>${name}</strong>: ${issue}<br>
              <strong>Kanaal:</strong> ${kanaal}
          </div>
          <div class="ticket-buttons">
              <button class="complete-button" ${completed ? 'style="background-color: green; color: white;"' : ''}>
                  ${completed ? 'Voltooid' : 'Voltooi'}
              </button>
              <button class="edit-button">Bewerken</button>
              <button class="delete-button">Verwijder</button>
          </div>
      `;
      document.getElementById('ticketList').appendChild(ticketItem);

      if (completed) {
          ticketItem.style.textDecoration = 'line-through';
      }

      ticketItem.querySelector('.delete-button').addEventListener('click', () => {
          removeTicket(ticketItem);
      });

      ticketItem.querySelector('.edit-button').addEventListener('click', () => {
          openEditModal(ticketItem);
      });

      ticketItem.querySelector('.complete-button').addEventListener('click', () => {
          toggleCompleteTicket(ticketItem);
      });
  }

  function saveTickets() {
      localStorage.setItem('tickets', JSON.stringify(tickets));
  }

  function removeTicket(ticketItem) {
      const ticketIndex = Array.from(document.querySelectorAll('#ticketList li')).indexOf(ticketItem);
      tickets.splice(ticketIndex, 1);
      saveTickets();
      ticketItem.remove();
  }

  function openEditModal(ticketItem) {
      editingIndex = Array.from(document.querySelectorAll('#ticketList li')).indexOf(ticketItem);
      const ticket = tickets[editingIndex];

      document.getElementById('editTicketName').value = ticket.name;
      document.getElementById('editTicketDescription').value = ticket.issue;
      populateKanaalDropdown(ticket.kanaal);
      
      document.getElementById('editModal').style.display = 'block';
  }

  function toggleCompleteTicket(ticketItem) {
      const ticketIndex = Array.from(document.querySelectorAll('#ticketList li')).indexOf(ticketItem);
      const completed = tickets[ticketIndex].completed;
      tickets[ticketIndex].completed = !completed;
      saveTickets();
      updateTicketList();
  }

  function updateTicketList() {
      document.getElementById('ticketList').innerHTML = '';
      tickets.forEach(ticket => {
          addTicketToList(ticket.name, ticket.issue, ticket.kanaal, ticket.completed);
      });
  }

  function exportToExcel() {
      const worksheet = XLSX.utils.json_to_sheet(tickets.map(ticket => ({
          Naam: ticket.name,
          Probleem: ticket.issue,
          Kanaal: ticket.kanaal,
          Voltooid: ticket.completed ? 'Ja' : 'Nee'
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
      
      XLSX.writeFile(workbook, 'tickets.xlsx');
  }

  document.getElementById('editTicketForm').addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('editTicketName').value;
      const issue = document.getElementById('editTicketDescription').value;
      const kanaal = document.getElementById('editTicketKanaal').value;

      if (editingIndex !== null) {
          tickets[editingIndex] = { name, issue, kanaal, completed: tickets[editingIndex].completed };
          saveTickets();
          updateTicketList();
          document.getElementById('editModal').style.display = 'none';
          editingIndex = null;
      }
  });

  document.querySelector('.close-button').addEventListener('click', () => {
      document.getElementById('editModal').style.display = 'none';
      editingIndex = null;
  });

  document.getElementById('ticketForm').addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const issue = document.getElementById('issue').value;
      const kanaal = document.getElementById('kanaal').value;

      const ticket = {
          name,
          issue,
          kanaal,
          completed: false
      };

      tickets.push(ticket);
      addTicketToList(name, issue, kanaal, false);
      saveTickets();

      document.getElementById('ticketForm').reset();
      document.querySelector('.dropdown-list').classList.remove('show');
  });

  document.getElementById('exportButton').addEventListener('click', exportToExcel);

  updateTicketList();
});
