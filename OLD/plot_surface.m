function plot_surface(points, Nx, Ny, h)
    X = reshape(points(:, 1), [Nx, Ny]);
    Y = reshape(points(:, 2), [Nx, Ny]); 
    Z = reshape(points(:, 3), [Nx, Ny]);
    
    h.XData = X;
    h.YData = Y; 
    h.ZData = Z; 
    
    drawnow limitrate;
end % function