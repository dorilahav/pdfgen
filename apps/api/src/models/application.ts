import { model, Schema } from 'mongoose';

export interface Application {
  id: string;
  name: string;
  secret: string;
  isInvalidated: boolean;
}

const ApplicationSchema = new Schema<Application>({
  name: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true
  },
  isInvalidated: {
    type: Boolean,
    default: false
  }
}, {virtuals: true});

ApplicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret, _options) {
    delete ret._id;
    delete ret.secret;
    delete ret.isInvalidated;
  },
});

export const Application = model('Application', ApplicationSchema, 'applications');