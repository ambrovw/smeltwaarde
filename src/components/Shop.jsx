import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import '../styles/components/Shop.css';
import useSilverPrice from '../hooks/useSilverPrice';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const { flashPrice, randPerGram } = useSilverPrice();

    useEffect(() => {
        fetch('https://kajuit.smeltwaarde.co.za/api/products/all')
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.products);
            });
    }, []);

    return (
        <div className="scroll-wrapper">
            <div className="container">
                <h1>Winkel</h1>
                <hr />

                <h3 className="section-header">Beskikbare Produkte</h3>
                <PhotoProvider maskOpacity={0.85}>
                    <table className="product-table">
                        <thead>
                        <tr>
                            <th>Fotos</th>
                            <th>Opskrif</th>
                            <th>Premie</th>
                            <th>Prys</th>
                            <th>Beskrywing</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.filter(product => product.enabled).map(product => {
                            const baseValue = product.purity * product.weight * (randPerGram || 0);
                            const adjustedPrice = baseValue * (1 + product.priceOffsetPercent / 100);

                            return (
                                <tr key={product._id} className="highlight-row">
                                    <td>
                                        <PhotoProvider>
                                            <PhotoView src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}>
                                                <img
                                                    src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}
                                                    alt={`${product.name} preview`}
                                                    className="image-preview"
                                                    style={{ cursor: 'zoom-in' }}
                                                />
                                            </PhotoView>
                                            {product.images.slice(1).map((img, index) => (
                                                <PhotoView key={index} src={`https://kajuit.smeltwaarde.co.za/uploads/${img}`}>
                                                    <span style={{ display: 'none' }} />
                                                </PhotoView>
                                            ))}
                                        </PhotoProvider>
                                    </td>
                                    <td>{product.heading}</td>
                                    <td>
                                        {product.priceOffsetPercent !== undefined
                                            ? `${product.priceOffsetPercent > 0 ? '+' : ''}${product.priceOffsetPercent}%`
                                            : '—'}
                                    </td>
                                    <td className={`price-columns ${flashPrice ? ' flash' : ''}`}>
                                    {randPerGram !== null
                                            ? `R${(
                                                product.purity *
                                                product.weight *
                                                randPerGram *
                                                (1 + product.priceOffsetPercent / 100)
                                            ).toFixed(2)}`
                                            : 'Laai...'}
                                    </td>

                                    <td>{product.description.split('\n').map((line, index) => (
                                            <span key={index}>
                                                {line}
                                                <br />
                                            </span>
                                        ))}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </PhotoProvider>
            </div>
        </div>
    );
}