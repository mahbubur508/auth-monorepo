// examples/extending-with-profile/user-profile.entity.ts
//
// This lives in YOUR app, not inside @mahbub508/nest-auth.
// It stores every extra field you need (name, phone, address, avatar, role, etc.)
// and links back to the package's AuthUser by id.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthUser } from '@mahbub508/nest-auth';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The link back to the package's user table.
  // `unique: true` enforces one profile per auth user (one-to-one).
  @Column({ unique: true })
  authUserId: string;

  @OneToOne(() => AuthUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authUserId' })
  authUser: AuthUser;

  // 👇 Add as many custom fields as your app needs
  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
