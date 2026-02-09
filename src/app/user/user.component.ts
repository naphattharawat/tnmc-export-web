import { Component, OnInit } from '@angular/core';
import { UsersService } from '../service/users.service';

interface User {
  id?: number;
  cid: string;
  name: string;
  editing?: boolean;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = { cid: '', name: '' };
  private backups: { [key: string]: User } = {};

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    void this.loadUsers();
  }

  private getBackupKey(u: User): string {
    return `${u.id ?? ''}-${u.cid}`;
  }

  addUser(): void {
    const cid = (this.newUser.cid || '').trim();
    if (!cid) return;
    const user: User = {
      cid: cid,
      name: (this.newUser.name || '').trim()
    };
    void this.saveUser(user);
  }

  resetForm(): void {
    this.newUser = { cid: '', name: '' };
  }

  startEdit(u: User): void {
    this.backups[this.getBackupKey(u)] = { ...u };
    u.editing = true;
  }

  cancelEdit(u: User): void {
    const key = this.getBackupKey(u);
    const b = this.backups[key];
    if (b) {
      Object.assign(u, b);
      delete this.backups[key];
    }
    u.editing = false;
  }

  saveEdit(u: User): void {
    u.editing = false;
    delete this.backups[this.getBackupKey(u)];
    void this.saveUser({ cid: u.cid, name: u.name });
  }

  deleteUser(u: User): void {
    if (!confirm(`ลบผู้ใช้ ${u.cid} ?`)) return;
    this.users = this.users.filter(x => x !== u);
  }

  private async loadUsers(): Promise<void> {
    try {
      const result: any = await this.usersService.getUsers();
      if (result.ok) {
        this.users = result.data;
      }
    } catch (error) {
      console.error('Users API Error (get):', error);
      this.users = [];
    }
  }

  private async saveUser(user: User): Promise<void> {
    try {
      await this.usersService.saveUser(user);
      this.newUser = { cid: '', name: '' };
      await this.loadUsers();
    } catch (error) {
      console.error('Users API Error (post):', error);
    }
  }
}
