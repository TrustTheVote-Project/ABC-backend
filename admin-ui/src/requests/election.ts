import { Election } from 'types';
import { get, post, SuccessResult } from './base';

export const getAll = async (): Promise<Array<Election>> => {
  return await get('/getElection')
}