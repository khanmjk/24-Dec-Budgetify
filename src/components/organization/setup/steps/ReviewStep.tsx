import React, { useState } from 'react';
import { useBudgetStore } from '../../../../store/budgetStore';
import { generateId } from '../../../../utils/generateId';
import { DepartmentSetupModal } from '../DepartmentSetupModal';
import type { Organization, BudgetCategory, Department } from '../../../../types/models';
import { AlertTriangle } from 'lucide-react';

interface ReviewStepProps {
  data: {
    organization: Partial<Organization>;
    budgetCategories: BudgetCategory[];
    departments: Department[];
  };
  onBack: () => void;
  onComplete: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onBack,
  onComplete
}) => {
  const store = useBudgetStore();
  const [currentDeptIndex, setCurrentDeptIndex] = useState<number>(-1);

  const totalDepartmentBudgets = data.departments.reduce((sum, dept) => sum + dept.totalBudget, 0);
  const remainingBudget = (data.organization.totalBudget || 0) - totalDepartmentBudgets;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate organization ID
    const organizationId = generateId();

    // Create organization with budget categories
    const organization: Organization = {
      id: organizationId,
      name: data.organization.name!,
      leaderName: data.organization.leaderName!,
      totalBudget: data.organization.totalBudget!,
      budgetCategories: data.budgetCategories.map(cat => ({
        ...cat,
        organizationId
      }))
    };

    // Create departments with organization ID
    const departments = data.departments.map(dept => ({
      ...dept,
      organizationId
    }));

    // Add organization and first department
    store.addOrganization(organization);
    store.addDepartment(departments[0]);
    
    // Start department setup wizard with first department
    setCurrentDeptIndex(0);
  };

  const handleDepartmentSetupComplete = () => {
    const nextIndex = currentDeptIndex + 1;
    
    if (nextIndex < data.departments.length) {
      // Add next department and continue setup
      store.addDepartment(data.departments[nextIndex]);
      setCurrentDeptIndex(nextIndex);
    } else {
      // All departments are set up
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Organization Summary */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.organization.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Leader</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.organization.leaderName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
              <dd className="mt-1 text-sm text-gray-900">${data.organization.totalBudget?.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Remaining Budget</dt>
              <dd className={`mt-1 text-sm font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remainingBudget.toLocaleString()}
                {remainingBudget < 0 && <AlertTriangle className="inline-block ml-1 h-4 w-4" />}
              </dd>
            </div>
          </dl>
        </div>

        {/* Budget Categories */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Categories</h3>
          <div className="space-y-3">
            {data.budgetCategories.map(category => (
              <div key={category.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Departments</h3>
          <div className="space-y-4">
            {data.departments.map(dept => (
              <div key={dept.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-500">Head: {dept.departmentHeadName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${dept.totalBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Organization
        </button>
      </div>

      {currentDeptIndex >= 0 && currentDeptIndex < data.departments.length && (
        <DepartmentSetupModal
          departmentId={data.departments[currentDeptIndex].id}
          departmentName={data.departments[currentDeptIndex].name}
          departmentBudget={data.departments[currentDeptIndex].totalBudget}
          onClose={handleDepartmentSetupComplete}
        />
      )}
    </div>
  );
};