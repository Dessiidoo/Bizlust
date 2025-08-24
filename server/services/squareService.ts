import { SquareClient, SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

// Only require credentials in production or when actually using Square features
const isSquareEnabled = process.env.SQUARE_ACCESS_TOKEN && 
                        process.env.SQUARE_APPLICATION_ID && 
                        process.env.SQUARE_LOCATION_ID;

// Initialize Square client with fallback
let client: any = null;

if (isSquareEnabled) {
  try {
    client = new SquareClient({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
    });
  } catch (error) {
    console.warn('Square client initialization failed:', error);
  }
}

export interface SquareCustomer {
  id: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  companyName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number; // in cents
  cadence: 'MONTHLY' | 'ANNUALLY';
}

export interface CreateSubscriptionRequest {
  customerId: string;
  planVariationId: string;
  cardId?: string;
}

class SquareService {
  private customersApi = client?.customersApi;
  private subscriptionsApi = client?.subscriptionsApi;
  private catalogApi = client?.catalogApi;
  private paymentsApi = client?.paymentsApi;

  private checkSquareEnabled() {
    if (!client || !isSquareEnabled) {
      throw new Error('Square integration not configured. Please add your Square API credentials.');
    }
  }

  // Create or get customer
  async createCustomer(customerData: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    companyName?: string;
  }): Promise<SquareCustomer> {
    this.checkSquareEnabled();
    try {
      const result = await this.customersApi!.createCustomer({
        idempotencyKey: uuidv4(),
        givenName: customerData.givenName,
        familyName: customerData.familyName,
        emailAddress: customerData.emailAddress,
        companyName: customerData.companyName,
      });

      const customer = result.result.customer;
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      return {
        id: customer.id!,
        givenName: customer.givenName,
        familyName: customer.familyName,
        emailAddress: customer.emailAddress,
        companyName: customer.companyName,
      };
    } catch (error) {
      console.error('Error creating Square customer:', error);
      throw new Error('Failed to create customer in Square');
    }
  }

  // Get customer by ID
  async getCustomer(customerId: string): Promise<SquareCustomer | null> {
    this.checkSquareEnabled();
    try {
      const result = await this.customersApi!.retrieveCustomer(customerId);
      const customer = result.result.customer;
      
      if (!customer) {
        return null;
      }

      return {
        id: customer.id!,
        givenName: customer.givenName,
        familyName: customer.familyName,
        emailAddress: customer.emailAddress,
        companyName: customer.companyName,
      };
    } catch (error) {
      console.error('Error retrieving Square customer:', error);
      return null;
    }
  }

  // Create subscription plan (catalog item)
  async createSubscriptionPlan(plan: SubscriptionPlan): Promise<string> {
    this.checkSquareEnabled();
    try {
      const result = await this.catalogApi!.upsertCatalogObject({
        idempotencyKey: uuidv4(),
        object: {
          type: 'SUBSCRIPTION_PLAN_VARIATION',
          id: `#${plan.id}`,
          subscriptionPlanVariationData: {
            name: plan.name,
            phases: [
              {
                cadence: plan.cadence,
                periods: 1,
                recurringPriceMoney: {
                  amount: BigInt(plan.amount),
                  currency: 'USD',
                },
              },
            ],
          },
        },
      });

      return result.result.catalogObject?.id || '';
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw new Error('Failed to create subscription plan');
    }
  }

  // Create subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<any> {
    this.checkSquareEnabled();
    try {
      const result = await this.subscriptionsApi!.createSubscription({
        idempotencyKey: uuidv4(),
        locationId: process.env.SQUARE_LOCATION_ID!,
        planVariationId: request.planVariationId,
        customerId: request.customerId,
        cardId: request.cardId,
        timezone: 'UTC',
      });

      return result.result.subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Get subscription
  async getSubscription(subscriptionId: string): Promise<any> {
    this.checkSquareEnabled();
    try {
      const result = await this.subscriptionsApi!.retrieveSubscription(subscriptionId);
      return result.result.subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<any> {
    this.checkSquareEnabled();
    try {
      const result = await this.subscriptionsApi!.cancelSubscription(subscriptionId);
      return result.result.subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Create payment intent for one-time payments
  async createPayment(amount: number, customerId?: string): Promise<any> {
    this.checkSquareEnabled();
    try {
      const result = await this.paymentsApi!.createPayment({
        idempotencyKey: uuidv4(),
        amountMoney: {
          amount: BigInt(amount),
          currency: 'USD',
        },
        sourceId: 'EXTERNAL', // Will be replaced with actual payment source
        locationId: process.env.SQUARE_LOCATION_ID!,
        buyerEmailAddress: customerId ? undefined : 'customer@example.com',
      });

      return result.result.payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  // List customer subscriptions
  async getCustomerSubscriptions(customerId: string): Promise<any[]> {
    this.checkSquareEnabled();
    try {
      const result = await this.subscriptionsApi!.searchSubscriptions({
        query: {
          filter: {
            customerIds: [customerId],
          },
        },
      });

      return result.result.subscriptions || [];
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error);
      return [];
    }
  }
}

export const squareService = new SquareService();