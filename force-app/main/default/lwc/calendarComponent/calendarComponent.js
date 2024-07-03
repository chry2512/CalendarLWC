/**
 * @description       :  controller js for CalendarComponent
 * @author            : Christian Niro
 * @group             : 
 * @last modified on  : 07-03-2024
 * @last modified by  : 
**/
import { LightningElement, track } from 'lwc';
import manageData from '@salesforce/apex/CalendarController.manageData';


export default class CalendarComponent extends LightningElement {
    @track date = new Date(); // Data corrente
    @track selectedDate = ''; // Data selezionata dall'utente
    @track days = []; // Array per memorizzare i giorni del mese

    // Restituisce la classe CSS per un giorno specifico
    getDayClass(day) {
        let classes = 'day'; // Classe di base per tutti i giorni
        if (!day.day) {
            classes = 'day-empty'; // Classe per i giorni vuoti (non appartenenti al mese corrente)
        } else if (day.isToday) {
            classes += ' today'; // Aggiunge la classe per il giorno corrente
        } else if (day.isPast) {
            classes += ' past'; // Aggiunge la classe per i giorni passati
        }
        return classes;
    }

    // Getter per ottenere la stringa del mese e dell'anno corrente in italiano
    get monthYear() {
        return this.date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    }

    // Processa i giorni per aggiungere la classe CSS corretta
    get processedDays() {
        return this.days.map(day => ({
            ...day,
            cssClass: this.getDayClass(day) // Aggiunge la classe CSS a ogni giorno
        }));
    }

    // Callback chiamata quando il componente è inserito nel DOM
    connectedCallback() {
        this.renderCalendar(); // Renderizza il calendario
        this.highlightCurrentAndPastDays(); // Evidenzia il giorno corrente e i giorni passati
    }

    // Callback chiamata dopo il rendering del componente
    renderedCallback() {
        this.addEventListeners(); // Aggiunge gli event listener
    }

    // Aggiunge gli event listener ai giorni per gestire il click
    addEventListeners() {
        const days = this.template.querySelectorAll('.days div');
        days.forEach(day => {
            day.addEventListener('click', (event) => this.handleDayClick(event));
        });
    }

    // Evidenzia il giorno corrente e i giorni passati
    highlightCurrentAndPastDays() {
        const today = new Date();
        const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        this.days = this.days.map(day => ({
            ...day,
            isToday: day.date === formattedToday, // Imposta isToday se il giorno è oggi
            isPast: day.date < formattedToday // Imposta isPast se il giorno è passato
        }));
    }

    // Gestisce il click su un giorno
    handleDayClick(event) {
        const previouslySelected = this.template.querySelector('.day.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected'); // Rimuove la selezione precedente
        }

        event.currentTarget.classList.add('selected'); // Seleziona il giorno cliccato
        this.selectedDate = event.currentTarget.getAttribute('data-date'); // Aggiorna la data selezionata
        console.log('Selected date: ' + this.selectedDate); // Log della data selezionata
        
        //chiama controller apex
        manageData({ selectedDate: this.selectedDate })
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.error('Errore:', error);
            });
    }

    
    // Renderizza il calendario per il mese corrente
    renderCalendar() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adegua il primo giorno della settimana (domenica = 0)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Ottiene il numero di giorni nel mese

        this.days = []; // Reset dell'array dei giorni

        // Aggiunge giorni vuoti fino al primo giorno del mese
        for (let i = 0; i < firstDay; i++) {
            this.days.push({ day: null, id: `empty-${i}`, date: '', cssClass: '' }); 
        }

        // Aggiunge i giorni del mese
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            let cssClass = 'day';
            if (this.selectedDate === date) {
                cssClass += ' selected'; // Aggiunge la classe selected se il giorno corrisponde alla data selezionata
            }
            this.days.push({ day: i, id: `day-${i}`, date: date, cssClass: cssClass }); 
        }

        this.highlightCurrentAndPastDays(); // Evidenzia il giorno corrente e i giorni passati
    }

    // Metodo per rimuovere l'evidenziazione del giorno selezionato
    removeSelectedDayHighlight() {
        console.log('Removing method');
        const selectedDayElement = this.template.querySelector('.day.selected');
        console.log("const value", selectedDayElement);
        if (selectedDayElement) {
            console.log('Removing selected-day class');
            selectedDayElement.classList.remove('selected');
        }
    }
        
    // Naviga al mese precedente
    prevMonth() {
        this.date.setMonth(this.date.getMonth() - 1);
        this.renderCalendar(); // Rerenderizza il calendario
    }

    // Naviga al mese successivo
    nextMonth() {
        this.date.setMonth(this.date.getMonth() + 1);
        this.selectedDate = ''; // Cancella la data selezionata
        this.removeSelectedDayHighlight(); // Rimuove l'evidenziazione del giorno selezionato
        this.renderCalendar(); // Rerenderizza il calendario
    }
}