const knex = require('../../database/connection');
const Yup = require('yup');

class ExchangeOfferController {
  async indexSent(req, res) {
    const sender_id = req.userId;

    const SentExchanges = await knex('exchange_offers')
      .select(
        'id',
        'receiver_id',
        'product_target_id',
        'products_offer_id',
        'exchanged'
      )
      .where({ sender_id });

    return res.status(200).json(SentExchanges);
  }

  async indexReceived(req, res) {
    const receiver_id = req.userId;

    const receivedExchanges = await knex('exchange_offers')
      .select(
        'id',
        'sender_id',
        'product_target_id',
        'products_offer_id',
        'exchanged'
      )
      .where({ receiver_id });

    return res.status(200).json(receivedExchanges);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      receiver_id: Yup.number().required(),
      product_target_id: Yup.number().required(),
      products_offer_id: Yup.array().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const { receiver_id } = req.body;

      const receiverExists = await knex('users')
        .where({ id: receiver_id })
        .first();

      if (!receiverExists) {
        return res.status(400).json({ error: 'Receiver user not found.' });
      }

      const { product_target_id } = req.body;
      const sender_id = req.userId;

      const targetProductExists = await knex('products')
        .where({ id: product_target_id })
        .whereNot({ user_id: sender_id })
        .first();

      if (!targetProductExists) {
        return res.status(400).json({ error: 'Target product not found.' });
      }

      const { products_offer_id } = req.body;

      const offerProductsExists = await knex('products')
        .select('id')
        .whereIn('id', products_offer_id)
        .where({ user_id: sender_id });

      if (products_offer_id.length !== offerProductsExists.length) {
        return res
          .status(400)
          .json({ error: 'You can only add personal products to the offer.' });
      }

      const exchangeOffer = { sender_id, ...req.body };

      const persistedExchangeOffer = await knex('exchange_offers')
        .insert(exchangeOffer)
        .returning([
          'id',
          'sender_id',
          'receiver_id',
          'product_target_id',
          'products_offer_id',
          'exchanged',
        ]);

      return res.status(201).json(persistedExchangeOffer);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      exchanged: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    try {
      const { id: exchangeId } = req.params;

      const exchangeOfferExists = await knex('exchange_offers')
        .where({
          id: exchangeId,
        })
        .first();

      if (!exchangeOfferExists) {
        return res.status(400).json({ error: 'Exchange offer not found.' });
      }

      if (exchangeOfferExists.exchanged !== null) {
        return res
          .status(400)
          .json({ error: 'Exchange offer already edited.' });
      }

      const receiver_id = req.userId;
      const sender_id = exchangeOfferExists.sender_id;

      if (sender_id === receiver_id) {
        return res
          .status(400)
          .json({ error: 'You cannot edit the offer you create.' });
      }

      const { exchanged } = req.body;
      const targetProduct = exchangeOfferExists.product_target_id;
      const offeredProducts = exchangeOfferExists.products_offer_id;

      const trx = await knex.transaction();

      if (exchanged === true) {
        await trx('products')
          .update({ user_id: sender_id })
          .where({ id: targetProduct });

        await trx('products')
          .update({ user_id: receiver_id })
          .whereIn('id', offeredProducts);
      }

      const updatedExchange = await trx('exchange_offers')
        .update({ exchanged })
        .where({
          id: exchangeId,
        })
        .returning(['id', 'sender_id', 'exchanged']);

      await trx.commit();

      return res.status(200).json(updatedExchange);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}

module.exports = new ExchangeOfferController();
