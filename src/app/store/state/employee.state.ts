import { Employees } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';

export interface IEmployeesState {
  employees: Employees;
  error: string | null;
}

export const initialEmployeesState: IEmployeesState = {
  employees: null,
  error: null
};
