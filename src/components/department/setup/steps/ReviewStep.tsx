import React from 'react';
import { useBudgetStore } from '../../../../store/budgetStore';
import { generateId } from '../../../../utils/generateId';
import type { Team, Manager } from '../../../../types/models';

interface ReviewStepProps {
  data: {
    teams: Team[];
    managers: Manager[];
  };
  departmentId: string;
  departmentBudget: number;
  onBack: () => void;
  onComplete: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  departmentId,
  departmentBudget,
  onBack,
  onComplete
}) => {
  const store = useBudgetStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add managers
    data.managers.forEach(manager => {
      store.addManager(manager);
    });

    // Add teams and budgets
    data.teams.forEach(team => {
      // Create budget with generated ID
      if (team.budget) {
        const budgetId = generateId();
        const budget = {
          ...team.budget,
          id: budgetId
        };
        store.addBudget(budget);
        
        // Add team with budget reference
        store.addTeam({
          ...team,
          budget
        });
      }
    });

    onComplete();
  };

  const totalAllocated = data.teams.reduce((sum, team) => sum + (team.budget?.totalAmount || 0), 0);
  const remainingBudget = departmentBudget - totalAllocated;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h2>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Department Budget</dt>
              <dd className="mt-1 text-sm text-gray-900">${departmentBudget.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Allocated</dt>
              <dd className="mt-1 text-sm text-indigo-600">${totalAllocated.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Remaining</dt>
              <dd className={`mt-1 text-sm font-medium ${
                remainingBudget < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${remainingBudget.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Teams & Budgets</h3>
          <div className="space-y-4">
            {data.teams.map((team, index) => {
              const manager = data.managers.find(m => m.id === team.managerId);
              return (
                <div key={team.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-500">Manager: {manager?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${team.budget?.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
};