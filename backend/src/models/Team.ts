import mongoose, { Document, Schema } from 'mongoose';

export enum TeamRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: ITeamMember[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(TeamRole), default: TeamRole.VIEWER },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [teamMemberSchema],
    inviteCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

teamSchema.index({ 'members.userId': 1 });

export const Team = mongoose.model<ITeam>('Team', teamSchema);