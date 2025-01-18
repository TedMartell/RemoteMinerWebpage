import { miningItems } from "./data/miningItems.js"
import { smeltedItems } from "./data/smeltedItems.js"
import { consumableItems } from "./data/consumableItems.js"
import { smelterRecipes } from "./data/smelterRecipes.js"
export const globalInventory = {items:{}, value: 0, weight:0};
export const minerInventory = {items:{}, value: 0, weight:0};
export const consumablesInventory = {items:{}, value: 0, weight:0};
export const smelterInventory = {items:{}, value: 0, weight:0};

export function destroyBlock(blockType) {
	const blocks = blockType.instances();

	for (const block of blocks) {
		const hp = block.instVars.HP;

		if (hp <= 0) {
			block.destroy();
			block.Destroyed = true
		}
	}
}

//Inventory
export function addToInventory(inventory, item, quantity) {
	console.log(`${inventory}, ${item}, ${quantity}`)

    if (inventory.items[item.name]) {
        inventory.items[item.name] += quantity;
    } else {
        inventory.items[item.name] = quantity
    }
	inventory.value += (quantity * item.value)
	inventory.weight += (quantity * item.weight)
	
	console.log(`${quantity} ${item.name} added to inventory.`);
	console.log(inventory)
}
    


export function removeFromInventory(inventory, item, quantity) {
    if (inventory.items[item.name] && inventory.items[item.name] >= quantity) {
        inventory.items[item.name] -= quantity;

        if (inventory.items[item.name] === 0) {
            delete inventory.items[item.name];
        }
		
		inventory.value -= (quantity * item.value)
		inventory.weight -= (quantity * item.weight)
		

        console.log(`${quantity} ${item.name}(s) removed from inventory.`);
		console.log(inventory);
        return true;
    } else {
        console.log(`Not enough ${item.name} in inventory.`);
        return false;
    }
		
}

export function getInventory(inventory) {
    return inventory;
}

export function moveAllItems(sourceInventory, destinationInventory) {
    for (const [itemName, quantity] of Object.entries(sourceInventory.items)) {
        // Get item details from a predefined items list
        const item = miningItems[itemName];

        // Remove from source inventory
        const removed = removeFromInventory(sourceInventory, item, quantity);

        // If successfully removed, add to destination inventory
        if (removed) {
            addToInventory(destinationInventory, item, quantity);
        }
    }
}

// Function to move a specified quantity of a specific item
export function moveItemWithQuantity(sourceInventory, destinationInventory, itemName, quantity) {
    const item = miningItems[itemName];
    if (!item) {
        console.log(`Item ${itemName} does not exist in miningItems.`);
        return;
    }

    const removed = removeFromInventory(sourceInventory, item, quantity);
    if (removed) {
        addToInventory(destinationInventory, item, quantity);
    }
}


// Function to set text object with inventory
export function updateInventoryText(inventory) {
    let inventoryText = "";

    for (let item in inventory.items) {
        if (inventory.items.hasOwnProperty(item)) {
            inventoryText += `${item}: ${inventory.items[item]}\n`;
        }
    }

    inventoryText += `\nTotal Value: ${inventory.value}\nTotal Weight: ${inventory.weight}`;
    
}




const scriptsInEvents = {

	async Game_event_sheet_Event94_Act3(runtime, localVars)
	{
		runtime.globalVars.minerInventoryValue = String(minerInventory.value);
		runtime.globalVars.minerInventoryWeight = String(minerInventory.weight);
		
	},

	async Game_event_sheet_Event461_Act1(runtime, localVars)
	{
localVars.Shopping_List = `Dynamite ${runtime.objects.Shop_Cart_Object.instVars}`
	},

	async Game_event_sheet_Event488_Act1(runtime, localVars)
	{
		moveAllItems(minerInventory, globalInventory)
		
	},

	async Game_event_sheet_Event532_Act2(runtime, localVars)
	{
		if (localVars.selectedRecipe in smelterRecipes) {
			localVars.isRecipeSelected = 1
		}
	},

	async Game_event_sheet_Event537_Act3(runtime, localVars)
	{
		// get the correct furnace
		var smelterFurnaces = runtime.objects.Smelter_Furnace_1_Object.getAllInstances()
		for (var i = 0; i < smelterFurnaces.length; i++) {
			var tmpSmelterFurnace = smelterFurnaces[i]
			if (tmpSmelterFurnace.instVars.ID == localVars.smelterId) {
				var smelterFurnace = smelterFurnaces[i]
			}
		}
		
		// get the crafting amount
		var craftingAmount = smelterFurnace.instVars.Crafting_Amount
		
		// get the global inventoty
		var globalInventory = runtime.objects.Global_Inventory_Object.getFirstInstance()
		// subtract the required items from global inventory
		var recipe = smelterRecipes[localVars.selectedRecipe]
		var requiredItemList = Object.keys(recipe.requiredItems)
		for (var i = 0; i < requiredItemList.length; i++) {
			globalInventory.instVars[requiredItemList[i]] -= 
				craftingAmount * recipe.requiredItems[requiredItemList[i]]
		}
		
		// setting smelting time per item
		localVars.smeltingTimePerItem = recipe.smelting_time
	},

	async Game_event_sheet_Event548_Act3(runtime, localVars)
	{
		var smelterFurnaces = runtime.objects.Smelter_Furnace_1_Object.getAllInstances()
		for (var i = 0; i < smelterFurnaces.length; i++) {
			var tmpSmelterFurnace = smelterFurnaces[i]
			if (tmpSmelterFurnace.instVars.ID == localVars.localSmelterId) {
				var smelterFurnace = smelterFurnaces[i]
			}
		}
		
		smelterFurnace.instVars.Smelt_Next_Item = 0
		
		// getting recipe
		var recipe = smelterRecipes[localVars.localSelectedRecipe]
		// setting smelting time per item
		localVars.smeltingTimePerItem = recipe.smelting_time
	},

	async Game_event_sheet_Event548_Act5(runtime, localVars)
	{
		var smelterFurnaces = runtime.objects.Smelter_Furnace_1_Object.getAllInstances()
		for (var i = 0; i < smelterFurnaces.length; i++) {
			var tmpSmelterFurnace = smelterFurnaces[i]
			if (tmpSmelterFurnace.instVars.ID == localVars.localSmelterId) {
				var smelterFurnace = smelterFurnaces[i]
			}
		}
		
		smelterFurnace.instVars.Crafting_Amount -= 1
		
		// get the global inventoty
		var globalInventory = runtime.objects.Global_Inventory_Object.getFirstInstance()
		
		// add a the output item to the global inventory
		var recipe = smelterRecipes[localVars.localSelectedRecipe]
		var outputList = Object.keys(recipe.output)
		for (var i = 0; i < outputList.length; i++) {
			globalInventory.instVars[outputList[i]] += 
				recipe.output[outputList[i]]
		}
		
		if (smelterFurnace.instVars.Crafting_Amount == 0) {
			smelterFurnace.instVars.Furnace_Active = 0
			smelterFurnace.instVars.Smelt_Next_Item = 0
		} else {
			smelterFurnace.instVars.Smelt_Next_Item = 1
		}
	},

	async Game_event_sheet_Event553_Act1(runtime, localVars)
	{
		localVars.maxAmount = Number.POSITIVE_INFINITY
		// getting global inventory
		var globalInventory = runtime.objects.Global_Inventory_Object.getFirstInstance()
		// getting recipe
		var recipe = smelterRecipes[localVars.selectedRecipe]
		// looping through all required items for the recipe
		var requiredItemList = Object.keys(recipe.requiredItems)
		for (var i = 0; i < requiredItemList.length; i++) {
			// setting recipeText
			localVars.recipeText += requiredItemList[i] + " X" 
			localVars.recipeText += recipe.requiredItems[requiredItemList[i]]
			if (i < requiredItemList.length - 1) {
				localVars.recipeText += ", "
			}
			// setting max amount according to the amount 
			// of required item which player can create the least amount
			// of items from
			var numberOfitemsInInventory = globalInventory.instVars[requiredItemList[i]]
			var itemMaxAmount = Math.floor(numberOfitemsInInventory/recipe.requiredItems[requiredItemList[i]])
			if (itemMaxAmount < localVars.maxAmount) {
				localVars.maxAmount = itemMaxAmount
			}
		}
	},

	async Game_event_sheet_Event568_Act3(runtime, localVars)
	{
		console.log(localVars.Ore)
	},

	async Game_event_sheet_Event633_Act2(runtime, localVars)
	{
		
	},

	async Game_event_sheet_Event839_Act2(runtime, localVars)
	{
		
	},

	async Smelter_event_sheet_Event2_Act3(runtime, localVars)
	{
		moveItemWithQuantity(globalInventory, smelterInventory, 2) 
	},

	async Smelter_event_sheet_Event13_Act3(runtime, localVars)
	{
		removeFromInventory(smelterInventory, miningItems[runtime.globalVars.CraftingItemType], runtime.globalVars.RequiredCraftingItems)
	},

	async Smelter_event_sheet_Event13_Act5(runtime, localVars)
	{
		addToInventory(globalInventory, smeltedItems.aluminium_Ingot_Inv, 1)
	},

	async Smelter_event_sheet_Event20_Act4(runtime, localVars)
	{
		moveItemWithQuantity(globalInventory, smelterInventory, runtime.globalVars.CraftingItemType, runtime.globalVars.TotalRequiredCraftingItems)
	},

	async Smelter_event_sheet_Event20_Act5(runtime, localVars)
	{
console.log(`crafting time ${runtime.globalVars.CraftingTime}`)
	},

	async Smelter_event_sheet_Event22_Act1(runtime, localVars)
	{
		runtime.globalVars.CraftingMaxAmount = Math.floor(globalInventory.items["Aluminium_Ore_Inv"] / 2) || 0;
		
	},

	async Smelter_event_sheet_Event23_Act5(runtime, localVars)
	{
		runtime.globalVars.AvailableCraftingItems = globalInventory.items["Aluminium_Ore_Inv"] || 0;
		
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

