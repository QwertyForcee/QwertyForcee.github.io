import { AfterViewChecked, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BoardFilter } from 'src/app/models/board-filter';
import { Priority } from 'src/app/models/priority';
import { Status } from 'src/app/models/status';
import { Ticket } from 'src/app/models/ticket';
import { User } from 'src/app/models/user';
import { MockServerService } from 'src/app/services/mock-server.service';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewChecked {

  headersEventsInited = false;
  filters: BoardFilter = {
    type: [],
    assignedTo: [],
    priority: []
  } as BoardFilter;

  //tickets$: Observable<Ticket[]>;
  tickets: Ticket[] = [];
  statuses: Status[] = [];
  priorities: Priority[] = [];
  users: User[] = [];

  creatingNewTicket = false;
  viewTicket = false;
  viewTicketId = 0;

  constructor(private mockService: MockServerService, private element: ElementRef) {
    this.mockService.tickets$.subscribe(
      {
        next: (e) => {
          this.tickets = e;
        }
      }
    );
    this.mockService.getTickets();
  }

  ngAfterViewChecked(): void {
    if (!this.headersEventsInited) {
      this.headersEventsInited = true;
      const headers = this.element.nativeElement.querySelectorAll('div.board-column');
      headers.forEach((header: any) => {

        header.addEventListener('dragover', ()=>{
          console.log('LOG: dragover');
          document.querySelectorAll('.chosen-board-header').forEach(el=>el.classList.remove('chosen-board-header'));

          header.classList.add('chosen-board-header');
        });

        // header.addEventListener('dragleave', ()=>{
        //   setTimeout(()=>{
        //     header.classList.remove('chosen-board-header');
        //   }, 0);
        // });
      });
    }
  }

  ngOnInit(): void {
    this.statuses = this.mockService.getStatuses();
    this.priorities = this.mockService.getPriorities();
    //this.tickets = this.mockService.getTickets();
    this.users = this.mockService.getUsers();

  }

  getTicketsByStatusId(statusId: number): Ticket[] {
    return this.tickets.filter(t => t.statusId === statusId && this.applyFilters(t));
  }

  createNewTicket() {
    this.creatingNewTicket = true;
  }

  openTicket(id: number | string) {
    this.viewTicket = true;
    this.viewTicketId = +id;
  }

  deleteTicket(id: number | string) {
    this.mockService.deleteTicket(id);
  }

  getTicketToView(): Ticket | null {
    return this.tickets.find((t) => t.id === this.viewTicketId) ?? null;
  }

  closeTicketView() {
    this.viewTicket = false;
  }

  closeNewTicketView() {
    this.creatingNewTicket = false;
  }

  applyFilters(ticket: Ticket) {
    const [type, assignedTo, priority] = [
      this.filters.type.length === 0 ? true : this.filters.type.some(t => t === ticket.type || t === ""),
      this.filters.assignedTo.length === 0 ? true : this.filters.assignedTo.some(t => +t === ticket.assignedTo.id || +t === 0),
      this.filters.priority.length === 0 ? true : this.filters.priority.some(t => +t === ticket.priority.id || +t === 0)
    ];
    return type && assignedTo && priority;
  }

  filterChange(e: any, filterName?: string) {
    if (e && filterName && Object.keys(this.filters).includes(filterName)) {
      const v = [e.target.value];
      this.filters[filterName as (keyof BoardFilter)] = v;
    }
    /*if (e) {
      switch (filterName) {
        case 'priority': {
          this.filters.priority = [+(e.target.value)];
          break;
        }
        case 'assignedTo': {
          this.filters.assignedTo = [+(e.target.value)];
          break;
        }
      }
    }*/
  }
}
