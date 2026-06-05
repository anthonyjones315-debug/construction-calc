import { describe, expect, it, beforeEach } from 'vitest';
import { useStore } from '@/lib/store';

const initialState = useStore.getState();

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  describe('initial state', () => {
    it('has the correct default values', () => {
      const state = useStore.getState();
      expect(state.activeCalculator).toBe('concrete');
      expect(state.budgetItems).toEqual([]);
      expect(state.estimateCart).toEqual([]);
      expect(state.taxRate).toBe(0);
      expect(state.isUpdatingPrices).toBe(false);
      expect(state.isAnalyzing).toBe(false);
      expect(state.showScrollTop).toBe(false);
      expect(state.aiAnalyses).toEqual({});
    });
  });

  describe('app actions', () => {
    it('setActiveCalculator updates the active calculator', () => {
      useStore.getState().setActiveCalculator('framing');
      expect(useStore.getState().activeCalculator).toBe('framing');
    });

    it('setTaxRate updates the tax rate', () => {
      useStore.getState().setTaxRate(7.5);
      expect(useStore.getState().taxRate).toBe(7.5);
    });

    it('setShowScrollTop works correctly', () => {
      useStore.getState().setShowScrollTop(true);
      expect(useStore.getState().showScrollTop).toBe(true);

      useStore.getState().setShowScrollTop(false);
      expect(useStore.getState().showScrollTop).toBe(false);
    });

    it('setMarketPrices updates market prices', () => {
      const newPrices = { lumber: 100, concrete: 200 } as any; // Cast as any for partial test
      useStore.getState().setMarketPrices(newPrices);
      expect(useStore.getState().marketPrices).toEqual(newPrices);
    });

    it('setIsUpdatingPrices works correctly', () => {
      useStore.getState().setIsUpdatingPrices(true);
      expect(useStore.getState().isUpdatingPrices).toBe(true);
    });

    it('setIsAnalyzing works correctly', () => {
      useStore.getState().setIsAnalyzing(true);
      expect(useStore.getState().isAnalyzing).toBe(true);
    });

    it('setSelectedMaterial works correctly', () => {
      useStore.getState().setSelectedMaterial('some-material');
      expect(useStore.getState().selectedMaterial).toBe('some-material');
    });

    it('setMaterialQty works correctly', () => {
      useStore.getState().setMaterialQty(42);
      expect(useStore.getState().materialQty).toBe(42);
    });
  });


  describe('budget items', () => {
    const mockBudgetItem = {
      id: 'item-1',
      name: 'Test Item',
      quantity: 10,
      pricePerUnit: 5,
      unit: 'sqft'
    } as any;

    it('addBudgetItem adds an item to the budget', () => {
      useStore.getState().addBudgetItem(mockBudgetItem);
      expect(useStore.getState().budgetItems).toContainEqual(mockBudgetItem);
    });

    it('removeBudgetItem removes an item by id', () => {
      useStore.getState().addBudgetItem(mockBudgetItem);
      expect(useStore.getState().budgetItems.length).toBe(1);

      useStore.getState().removeBudgetItem('item-1');
      expect(useStore.getState().budgetItems.length).toBe(0);
    });

    it('updateBudgetItemPrice updates the price of a specific item', () => {
      useStore.getState().addBudgetItem(mockBudgetItem);
      useStore.getState().updateBudgetItemPrice('item-1', 15);

      const item = useStore.getState().budgetItems.find((i: any) => i.id === 'item-1');
      expect(item?.pricePerUnit).toBe(15);
    });

    it('setBudgetItems replaces the entire budget array', () => {
      const items = [mockBudgetItem, { ...mockBudgetItem, id: 'item-2' }];
      useStore.getState().setBudgetItems(items);
      expect(useStore.getState().budgetItems).toEqual(items);
    });
  });

  describe('estimate cart', () => {
    const mockCartItem = {
      id: 'cart-1',
      name: 'Cart Item',
      quantity: 5,
      price: 100
    } as any;

    it('addCartItem adds an item to the cart', () => {
      useStore.getState().addCartItem(mockCartItem);
      expect(useStore.getState().estimateCart).toContainEqual(mockCartItem);
    });

    it('removeCartItem removes an item by id', () => {
      useStore.getState().addCartItem(mockCartItem);
      expect(useStore.getState().estimateCart.length).toBe(1);

      useStore.getState().removeCartItem('cart-1');
      expect(useStore.getState().estimateCart.length).toBe(0);
    });

    it('clearCart removes all items from the cart', () => {
      useStore.getState().addCartItem(mockCartItem);
      useStore.getState().addCartItem({ ...mockCartItem, id: 'cart-2' });
      expect(useStore.getState().estimateCart.length).toBe(2);

      useStore.getState().clearCart();
      expect(useStore.getState().estimateCart.length).toBe(0);
    });
  });

  describe('ai analyses', () => {
    it('setAiAnalysis creates a new analysis entry', () => {
      const id = 'concrete';
      const content = 'This is a test analysis';

      useStore.getState().setAiAnalysis(id, content);

      const analysis = useStore.getState().aiAnalyses[id];
      expect(analysis).toBeDefined();
      expect(analysis?.calculatorId).toBe(id);
      expect(analysis?.content).toBe(content);
      expect(analysis?.timestamp).toBeGreaterThan(0);
    });

    it('clearAiAnalysis removes an analysis entry', () => {
      const id = 'framing';
      useStore.getState().setAiAnalysis(id, 'Test content');
      expect(useStore.getState().aiAnalyses[id]).toBeDefined();

      useStore.getState().clearAiAnalysis(id);
      expect(useStore.getState().aiAnalyses[id]).toBeUndefined();
    });
  });


  describe('calculator updates', () => {
    it('updateConcrete applies partial updates and preserves other fields', () => {
      const initial = useStore.getState().concrete;
      useStore.getState().updateConcrete({ thickness: 6, waste: 15 });

      const updated = useStore.getState().concrete;
      expect(updated.thickness).toBe(6);
      expect(updated.waste).toBe(15);
      expect(updated.length).toBe(initial.length); // Preserved
      expect(updated.type).toBe(initial.type); // Preserved
    });

    it('updateFraming applies partial updates', () => {
      const initial = useStore.getState().framing;
      useStore.getState().updateFraming({ spacing: 24, hasSheathing: true });

      const updated = useStore.getState().framing;
      expect(updated.spacing).toBe(24);
      expect(updated.hasSheathing).toBe(true);
      expect(updated.wallLength).toBe(initial.wallLength);
    });

    it('updateRoofing applies partial updates', () => {
      const initial = useStore.getState().roofing;
      useStore.getState().updateRoofing({ pitch: 6, type: 'metal' });

      const updated = useStore.getState().roofing;
      expect(updated.pitch).toBe(6);
      expect(updated.type).toBe('metal');
      expect(updated.length).toBe(initial.length);
    });

    it('updateFlooring applies partial updates', () => {
      const initial = useStore.getState().flooring;
      useStore.getState().updateFlooring({ waste: 15, costPerSqFt: 5.50 });

      const updated = useStore.getState().flooring;
      expect(updated.waste).toBe(15);
      expect(updated.costPerSqFt).toBe(5.50);
      expect(updated.length).toBe(initial.length);
    });

    it('updateInsulation applies partial updates', () => {
      const initial = useStore.getState().insulation;
      useStore.getState().updateInsulation({ type: 'sprayfoam', rValue: 21 });

      const updated = useStore.getState().insulation;
      expect(updated.type).toBe('sprayfoam');
      expect(updated.rValue).toBe(21);
      expect(updated.area).toBe(initial.area);
    });

    it('updateSprayFoam applies partial updates', () => {
      const initial = useStore.getState().sprayfoam;
      useStore.getState().updateSprayFoam({ thickness: 4, type: 'open' });

      const updated = useStore.getState().sprayfoam;
      expect(updated.thickness).toBe(4);
      expect(updated.type).toBe('open');
      expect(updated.area).toBe(initial.area);
    });

    it('updateCellulose applies partial updates', () => {
      const initial = useStore.getState().cellulose;
      useStore.getState().updateCellulose({ rValue: 49, type: 'dense-pack' });

      const updated = useStore.getState().cellulose;
      expect(updated.rValue).toBe(49);
      expect(updated.type).toBe('dense-pack');
      expect(updated.area).toBe(initial.area);
    });

    it('updateSiding applies partial updates', () => {
      const initial = useStore.getState().siding;
      useStore.getState().updateSiding({ area: 1500, waste: 15 });

      const updated = useStore.getState().siding;
      expect(updated.area).toBe(1500);
      expect(updated.waste).toBe(15);
      expect(updated.includeWaste).toBe(initial.includeWaste);
    });

    it('updatePaint applies partial updates', () => {
      const initial = useStore.getState().paint;
      useStore.getState().updatePaint({ coats: 3, waste: 10 });

      const updated = useStore.getState().paint;
      expect(updated.coats).toBe(3);
      expect(updated.waste).toBe(10);
      expect(updated.area).toBe(initial.area);
    });

    it('updateLabor applies partial updates', () => {
      const initial = useStore.getState().labor;
      useStore.getState().updateLabor({ workers: 4, hours: 10 });

      const updated = useStore.getState().labor;
      expect(updated.workers).toBe(4);
      expect(updated.hours).toBe(10);
      expect(updated.wage).toBe(initial.wage);
    });
  });
});
