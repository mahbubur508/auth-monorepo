import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum OtpType {
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

@Entity('auth_otp_tokens')
export class OtpToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column({ type: 'varchar' })
  type: OtpType;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
