import { CreatePool } from '../../components/create-pool/CreatePool';
import { PoolStepperContent } from '@/components/create-pool/PoolStepper';

export default function CreatePoolPage() {
  return (
    <>
      <PoolStepperContent />
      <CreatePool />
    </>
  );
}