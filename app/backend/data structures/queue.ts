export class Queue {
	items: any[];
	
    constructor() {
        this.items = [];
    }

    // Add an element to the queue
    enqueue(element) {
        this.items.push(element);
    }

    // Remove an element from the queue
    dequeue() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items.shift();
    }

    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Peek at the front element without removing it
    front() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items[0];
    }

    // Get the size of the queue
    size() {
        return this.items.length;
    }
}
