import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  constructor(
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  
  async ngOnInit(): Promise<void> {
  }
}
